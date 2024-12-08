const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Combina dois usuários e calcula sua compatibilidade!')
    .addUserOption(option => 
      option.setName('user1')
        .setDescription('O primeiro usuário para shippar')
        .setRequired(true))
    .addUserOption(option => 
      option.setName('user2')
        .setDescription('O segundo usuário para shippar')
        .setRequired(true)),
  async execute(interaction) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');

    if (user1.id === user2.id) {
      return interaction.reply({ content: 'Você não pode shippar alguém consigo mesmo!', ephemeral: true });
    }

    const compatibility = Math.floor(Math.random() * 101);
    const shipName = `${user1.username.slice(0, Math.floor(user1.username.length/2))}${user2.username.slice(Math.floor(user2.username.length/2))}`;

    const shipEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle(`💖 ${user1.username} & ${user2.username} 💖`)
      .setDescription(`**${shipName}** tem uma compatibilidade de **${compatibility}%**!`)
      .setImage('https://media.discordapp.net/attachments/1225569866254258190/1315182650331238460/R_1.gif?ex=67567aca&is=6755294a&hm=45be434f292362ee79094b6d62195d74bde4f6822ac696c5e395ef8fda9ec165&=')
      .addFields(
        { name: 'Avaliação', value: compatibility > 70 ? 'Muito compatíveis!' : compatibility > 40 ? 'Compatíveis' : 'Precisam de mais tempo para se conhecer...', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Chloe, a Cupida Virtual', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [shipEmbed], ephemeral: false });
  },
};