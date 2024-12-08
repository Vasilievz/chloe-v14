const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const weeklyReward = 1000;

const lastWeeklyTime = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('week')
    .setDescription('Receba sua recompensa semanal de Vick Coins!'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();

    if (lastWeeklyTime[userId] && now - lastWeeklyTime[userId] < 604800000) {
      const daysLeft = Math.ceil((604800000 - (now - lastWeeklyTime[userId])) / 86400000);
      return await interaction.reply({
        content: `Você já recebeu sua recompensa semanal. Volte em **${daysLeft} dias**!`,
        ephemeral: false
      });
    }

    const balances = interaction.client.mongodb.collection('balances');

    const userBalance = await balances.findOne({ userId });
    const newBalance = userBalance ? userBalance.balance + weeklyReward : weeklyReward;

    await balances.updateOne(
      { userId },
      { $set: { balance: newBalance } },
      { upsert: true }
    );

    lastWeeklyTime[userId] = now;

    const weeklyEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle(`Recompensa Semanal!`)
      .setDescription(`**${interaction.user.username}** recebeu **${weeklyReward} Vick Coins** como recompensa semanal!`)
      .addFields(
        { name: 'Novo Saldo', value: `**${newBalance}** Vick Coins`, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'Economia Mágica de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({
      embeds: [weeklyEmbed],
      ephemeral: false
    });
  },
};