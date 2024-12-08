const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { minerals } = require('../constants.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vendinha')
    .setDescription('Vender itens e pets no mercado!'),
  async execute(interaction) {
    const { mongodb } = interaction.client;
    const inventory = mongodb.collection('inventory');
    const balances = mongodb.collection('balances');

    const userId = interaction.user.id;

    const userInventory = await inventory.findOne({ userId });

    if (!userInventory || !userInventory.items || userInventory.items.length === 0) {
      return interaction.reply({ content: 'Seu inventário está vazio!', ephemeral: false });
    }

    const sellableItems = userInventory.items.filter(item => item.type === 'Mineral' || item.type === 'Pet');
    
    if (sellableItems.length === 0) {
      return interaction.reply({ content: 'Você não tem itens ou pets para vender.', ephemeral: false });
    }

    const options = sellableItems.map(item => {
      const mineral = minerals.find(min => min.id === item.id);
      return {
        label: `${item.name} (${mineral ? mineral.value : 'Valor desconhecido'} Vick Coins)`,
        value: item.id,
        description: item.type === 'Mineral' ? 'Mineral' : 'Pet'
      };
    });

    const selectMenu = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('sellItem')
          .setPlaceholder('Escolha o item ou pet para vender')
          .addOptions(options)
      );

    const vendinhaEmbed = new EmbedBuilder()
      .setColor('#FFC0CB')
      .setTitle('Vendinha de Chloe 🛍️')
      .setDescription('Selecione o item ou pet que deseja vender:')
      .setFooter({ text: '💖 Bot de Economia de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [vendinhaEmbed], components: [selectMenu], ephemeral: false });

    const collector = interaction.channel.createMessageComponentCollector({ filter: i => i.user.id === userId, time: 15000 });

    collector.on('collect', async i => {
      const itemId = i.values[0];
      const itemToSell = sellableItems.find(item => item.id === itemId);
      const mineralInfo = minerals.find(min => min.id === itemId);

      if (!itemToSell) {
        return i.update({ content: 'Item não encontrado no seu inventário.', components: [], ephemeral: false });
      }

      const sellValue = mineralInfo ? mineralInfo.value : 100;

      await inventory.updateOne({ userId }, { $pull: { items: { id: itemId } } });
      await balances.updateOne({ userId }, { $inc: { balance: sellValue } }, { upsert: true });

      const soldEmbed = new EmbedBuilder()
        .setColor('#FFC0CB')
        .setTitle('Venda Concluída! 💰')
        .setDescription(`Vendeu por ${sellValue} de Vick Coins`)
        .setFooter({ text: '💖 Bot de Economia de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

      await i.update({ embeds: [soldEmbed], components: [], ephemeral: false });
    });

    collector.on('end', () => {
      interaction.editReply({ content: 'Tempo de venda expirado.', components: [] });
    });
  },
};