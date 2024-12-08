const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Verifica seu saldo de Vick Coins!'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const balances = interaction.client.mongodb.collection('balances');

    const userBalance = await balances.findOne({ userId });
    const balance = userBalance ? userBalance.balance : 0;

    const balanceEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle('🪙 Carteira de Vick Coins')
      .setDescription(`**${interaction.user.username}**, aqui está o seu saldo atual:`)
      .addFields(
        { name: 'Saldo', value: `**${balance}** Vick Coins`, inline: true },
        { name: 'Proprietário', value: interaction.user.tag, inline: true },
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'Economia Mágica de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({
      embeds: [balanceEmbed],
      ephemeral: false
    });
  },
};