const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Mostra os usuários com mais Vick Coins.'),
  async execute(interaction) {
    const balances = interaction.client.mongodb.collection('balances');

    try {
      const sortedBalances = await balances.find({}).sort({ balance: -1 }).limit(10).toArray();
      const leaderboardEmbed = new EmbedBuilder()
        .setColor(0xFFB6C1)
        .setTitle('🏆 Leaderboard de Vick Coins')
        .setDescription('Aqui estão os usuários com mais Vick Coins:')
        .setTimestamp()
        .setFooter({ text: 'Economia Mágica de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

      sortedBalances.forEach((userBalance, index) => {
        const user = interaction.client.users.cache.get(userBalance.userId) || { username: 'Usuário Desconhecido' };
        leaderboardEmbed.addFields({
          name: `#${index + 1} - ${user.username}`,
          value: `**${userBalance.balance}** Vick Coins`,
          inline: false
        });
      });

      await interaction.reply({ embeds: [leaderboardEmbed], ephemeral: false });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Ocorreu um erro ao carregar o leaderboard.', ephemeral: true });
    }
  },
};