const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { minerals } = require('../constants.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Vá minerar por minerais preciosos!'),
  async execute(interaction) {
    const { mongodb } = interaction.client;
    const balances = mongodb.collection('balances');
    const inventory = mongodb.collection('inventory');
    const cooldowns = mongodb.collection('cooldowns');

    const userId = interaction.user.id;
    const now = Date.now();

    const cooldownResult = await cooldowns.findOne({ userId, command: 'mine' });
    if (cooldownResult && (now - cooldownResult.timestamp) < 20000) { 
      const timeLeft = Math.ceil((20000 - (now - cooldownResult.timestamp)) / 1000);
      return interaction.reply({ content: `⏳ Aguarde mais ${timeLeft} segundos antes de minerar novamente.`, ephemeral: true });
    }

    const totalRarity = minerals.reduce((sum, mineral) => sum + mineral.rarity, 0);
    const random = Math.random() * totalRarity;
    let currentSum = 0;
    let foundMineral;

    for (let mineral of minerals) {
      currentSum += mineral.rarity;
      if (random <= currentSum) {
        foundMineral = mineral;
        break;
      }
    }

    const updateResult = await inventory.updateOne(
      { userId },
      { $addToSet: { items: { id: foundMineral.id, name: foundMineral.name, type: 'Mineral' } } },
      { upsert: true }
    );

    const mineEmbed = new EmbedBuilder()
      .setColor('#FFC0CB')
      .setTitle('Mineração Bem-sucedida! ⛏️')
      .setDescription(`Você desenterrou ${foundMineral.name}!`)
      .addFields(
        { name: 'Raridade', value: `${foundMineral.rarity}%`, inline: true },
        { name: 'Valor', value: `${foundMineral.value} Vick Coins`, inline: true }
      )
      .setImage('https://media.discordapp.net/attachments/1225569866254258190/1315323795573309452/gifdogecoinmining.gif?ex=6756fe3e&is=6755acbe&hm=1b4130e598bcec50f20321e79879a93d8bddf24a1fa73bbcfb5f37d0cbbecd24&=')
      .setFooter({ text: '💖 Bot de Economia de Chloe', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [mineEmbed], ephemeral: false });

    await cooldowns.updateOne(
      { userId, command: 'mine' },
      { $set: { timestamp: now } },
      { upsert: true }
    );

    if (updateResult.upsertedCount > 0) {
      await interaction.followUp({ content: 'Seu inventário foi criado!', ephemeral: true });
    }
  },
};