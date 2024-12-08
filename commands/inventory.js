const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Veja seu inventário de itens.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const inventory = interaction.client.mongodb.collection('inventory');
    const pets = interaction.client.mongodb.collection('pets');

    const userInventory = await inventory.findOne({ userId });
    const inventoryEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle(`🧳 Inventário de ${interaction.user.username}`)
      .setDescription(userInventory && userInventory.items && userInventory.items.length > 0 ? 'Aqui estão seus itens:' : 'Seu inventário está vazio.');

    if (userInventory && userInventory.items) {
      for (const item of userInventory.items) {
        if (item.type === 'Pet') {
          const petStatus = await pets.findOne({ userId, petId: item.id });
          if (petStatus) {
            inventoryEmbed.addFields({
              name: item.name,
              value: `Tipo: ${item.type}\n` +
                     `Fome: ${petStatus.hunger}%\n` +
                     `Sede: ${petStatus.thirst}%`,
              inline: true
            });
          } else {
            inventoryEmbed.addFields({
              name: item.name,
              value: `Tipo: ${item.type}\n` +
                     `Status não encontrado`,
              inline: true
            });
          }
        } else {
          inventoryEmbed.addFields({
            name: item.name,
            value: `Tipo: ${item.type}`,
            inline: true
          });
        }
      }
    }

    await interaction.reply({ embeds: [inventoryEmbed], ephemeral: false });
  },
};