const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const workCooldown = 3600000;
const lastWorkTime = {};

const jobs = [
  { name: 'Babá de Dragão', pay: 20 },
  { name: 'Fazendeiro de Unicórnios', pay: 15 },
  { name: 'Vendedor de Magia', pay: 25 },
  { name: 'Confeiteiro de Nuvens', pay: 18 },
  { name: 'Guia de Aventuras Mágicas', pay: 30 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabalhe em um emprego mágico para ganhar Vick Coins!'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();

    if (lastWorkTime[userId] && (now - lastWorkTime[userId] < workCooldown)) {
      const timeLeft = Math.ceil((workCooldown - (now - lastWorkTime[userId])) / 60000);
      return await interaction.reply({
        content: `Você deve esperar mais **${timeLeft} minutos** antes de trabalhar novamente!`,
        ephemeral: false
      });
    }

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = job.pay;

    const balances = interaction.client.mongodb.collection('balances');

    const userBalance = await balances.findOne({ userId });
    const newBalance = userBalance ? userBalance.balance + earnings : earnings;

    await balances.updateOne(
      { userId },
      { $set: { balance: newBalance } },
      { upsert: true }
    );

    lastWorkTime[userId] = now;

    const workEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle(`**${interaction.user.username}** trabalhou!`)
      .setDescription(`**${interaction.user.username}** trabalhou como **${job.name}** e ganhou **${earnings} Vick Coins**!`)
      .addFields(
        { name: 'Novo Saldo', value: `**${newBalance}** Vick Coins`, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'Economia Mágica de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({
      embeds: [workEmbed],
      ephemeral: false
    });
  },
};