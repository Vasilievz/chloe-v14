const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('feed')
    .setDescription('Alimentar ou dar água ao seu pet.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const inventory = interaction.client.mongodb.collection('inventory');
    const pets = interaction.client.mongodb.collection('pets');

    const userInventory = await inventory.findOne({ userId });
    if (!userInventory || !userInventory.items || userInventory.items.length === 0) {
      return interaction.reply({ content: 'Seu inventário está vazio.', ephemeral: true });
    }

    const userPets = userInventory.items.filter(item => item.type === 'Pet');
    if (userPets.length === 0) {
      return interaction.reply({ content: 'Você não possui nenhum pet para alimentar.', ephemeral: true });
    }

    const petChoices = userPets.map(pet => ({
      label: pet.name,
      value: pet.id
    }));

    const petSelectRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('petSelect')
          .setPlaceholder('Escolha um pet')
          .addOptions(petChoices)
      );

    await interaction.reply({
      content: 'Escolha um pet para alimentar ou dar água:',
      components: [petSelectRow],
      ephemeral: true
    });

    const petFilter = i => i.customId === 'petSelect' && i.user.id === interaction.user.id;
    const petCollector = interaction.channel.createMessageComponentCollector({ petFilter, time: 15000 });

    petCollector.on('collect', async i => {
      const selectedPetId = i.values[0];
      const pet = userPets.find(p => p.id === selectedPetId);
      if (!pet) {
        await i.update({ content: 'Pet não encontrado no seu inventário.', components: [] });
        return;
      }

      const petStatus = await pets.findOne({ userId, petId: selectedPetId });
      if (!petStatus) {
        await i.update({ content: 'Erro ao encontrar o status do pet.', components: [] });
        return;
      }

      const userFoodAndDrink = userInventory.items.filter(item => item.type === 'Food' || item.type === 'Drink');

      const foodAndDrinkChoices = userFoodAndDrink.map(item => ({
        label: item.name,
        value: item.id
      }));

      if (foodAndDrinkChoices.length === 0) {
        await i.update({ content: 'Você não possui itens para alimentar ou dar água ao seu pet.', components: [] });
        return;
      }

      const itemSelectRow = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`selectItem-${selectedPetId}`)
            .setPlaceholder('Escolha um item para usar')
            .addOptions(foodAndDrinkChoices)
        );

      await i.update({
        content: `Selecione um item para alimentar ou dar água ao seu ${pet.name}:`,
        components: [itemSelectRow]
      });

      const itemFilter = itemInteraction => itemInteraction.customId.startsWith('selectItem') && itemInteraction.user.id === interaction.user.id;
      const itemCollector = interaction.channel.createMessageComponentCollector({ itemFilter, time: 15000 });

      itemCollector.on('collect', async itemInteraction => {
        const itemId = itemInteraction.values[0];
        const item = userFoodAndDrink.find(it => it.id === itemId);
        if (!item) {
          await itemInteraction.update({ content: 'Item não encontrado no seu inventário.', components: [] });
          return;
        }

        let updateField, maxValue;
        if (item.type === 'Food') {
          updateField = 'hunger';
          maxValue = 100;
        } else if (item.type === 'Drink') {
          updateField = 'thirst';
          maxValue = 100;
        } else {
          await itemInteraction.update({ content: 'Este item não pode ser usado para alimentar ou dar água.', components: [] });
          return;
        }

        if (petStatus[updateField] >= maxValue) {
          await itemInteraction.update({ content: `Seu ${pet.name} já está completamente ${updateField === 'hunger' ? 'satisfeito' : 'hidratado'}!`, components: [] });
          return;
        }

        const newLevel = Math.min(petStatus[updateField] + 20, maxValue); 
        await pets.updateOne({ userId, petId: selectedPetId }, { $set: { [updateField]: newLevel } });

        await inventory.updateOne({ userId }, { $pull: { items: { id: itemId } } });

        const statusEmbed = new EmbedBuilder()
          .setColor(0xFFB6C1)
          .setTitle(`Status do ${pet.name}`)
          .addFields(
            { name: 'Fome', value: `${newLevel}%`, inline: true },
            { name: 'Sede', value: `${petStatus.thirst}%`, inline: true }
          );

        await itemInteraction.update({
          content: `Você usou ${item.name} para ${updateField === 'hunger' ? 'alimentar' : 'hidratar'} seu ${pet.name}.`,
          embeds: [statusEmbed],
          components: []
        });
      });

      itemCollector.on('end', collected => {
        if (collected.size === 0) {
          i.editReply({ content: 'Tempo esgotado sem selecionar um item.', components: [] });
        }
      });
    });

    petCollector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'Tempo esgotado sem selecionar um pet.', components: [] });
      }
    });
  },
};