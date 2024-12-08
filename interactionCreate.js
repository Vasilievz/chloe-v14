module.exports = {
  handle: async (client, interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === 'buttonId') {
        await interaction.reply({ content: 'Você clicou no botão!', ephemeral: true });
      }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'selectMenuId') {
        const selectedOption = interaction.values[0];
        await interaction.reply({ content: `Você selecionou: ${selectedOption}`, ephemeral: true });
      }
    }
  },
};