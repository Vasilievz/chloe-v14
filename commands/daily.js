const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const dailyReward = 100;

const lastDailyTime = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Receba sua recompensa diária de Vick Coins!'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();


    if (lastDailyTime[userId] && now - lastDailyTime[userId] < 86400000) {
      const timeLeft = Math.ceil((86400000 - (now - lastDailyTime[userId])) / 3600000);
      return await interaction.reply({
        content: `Você já recebeu sua recompensa diária. Volte em **${timeLeft} horas**!`,
        ephemeral: false
      });
    }

    const balances = interaction.client.mongodb.collection('balances');

    const userBalance = await balances.findOne({ userId });
    const newBalance = userBalance ? userBalance.balance + dailyReward : dailyReward;

    await balances.updateOne(
      { userId },
      { $set: { balance: newBalance } },
      { upsert: true }
    );

    lastDailyTime[userId] = now;

    const dailyEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle(`Recompensa Diária!`)
      .setDescription(`**${interaction.user.username}** recebeu **${dailyReward} Vick Coins** como recompensa diária!`)
      .addFields(
        { name: 'Novo Saldo', value: `**${newBalance}** Vick Coins`, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'Economia Mágica de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({
      embeds: [dailyEmbed],
      ephemeral: false
    });
  },
};