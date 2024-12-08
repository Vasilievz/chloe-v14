const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steal')
    .setDescription('Tente roubar um pouco dos tesouros de outra pessoa!')
    .addUserOption(option => 
      option.setName('alvo')
        .setDescription('A vítima do seu ato audacioso')
        .setRequired(true)),
  async execute(interaction) {
    const { mongodb } = interaction.client;
    const balances = mongodb.collection('balances');
    const cooldowns = mongodb.collection('cooldowns');

    const thief = interaction.user.id;
    const target = interaction.options.getUser('alvo');
    const targetId = target.id;

    if (thief === targetId) {
      return interaction.reply({ content: 'Querida, tentar roubar de si mesma não é uma boa ideia!', ephemeral: true });
    }

    const targetBalance = await balances.findOne({ userId: targetId });
    if (!targetBalance || targetBalance.balance <= 0) {
      return interaction.reply({ content: `${target.username} não tem nem um centavo!`, ephemeral: true });
    }

    const now = Date.now();
    const cooldownResult = await cooldowns.findOne({ userId: thief, command: 'steal' });
    if (cooldownResult && (now - cooldownResult.timestamp) < 86400000) { 
      const timeLeft = 86400000 - (now - cooldownResult.timestamp);
      const hours = Math.floor(timeLeft / 3600000);
      const minutes = Math.floor((timeLeft % 3600000) / 60000);
      return interaction.reply({ content: `Calma, querida! Você só pode tentar roubar novamente em ${hours} horas e ${minutes} minutos.`, ephemeral: true });
    }

    const stealAmount = Math.floor(Math.random() * (targetBalance.balance * 0.3)) + 1;
    const successChance = 0.5;
    const success = Math.random() < successChance;

    const stealEmbed = new EmbedBuilder()
      .setColor('#FFC0CB')
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: '💖 Bot de Economia de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

    if (success) {
      await balances.updateOne({ userId: thief }, { $inc: { balance: stealAmount } }, { upsert: true });
      await balances.updateOne({ userId: targetId }, { $inc: { balance: -stealAmount } });
      
      stealEmbed
        .setTitle('Roubo Bem-sucedido! 💸')
        .setDescription(`Você conseguiu roubar ${stealAmount} moedas de ${target.username}! Que ousadia!`)
        .setImage('https://media.discordapp.net/attachments/1225569866254258190/1315319248188342346/db91cbd0ed083346dfb8e9b4eef5ad28e1d9688d_hq.gif?ex=6756fa02&is=6755a882&hm=2a71d3460a84be9d41db6f758aea53b7366ba546f897f1204ed87e82d84a03bc&='); // Substitua com uma URL de uma imagem que combine com o tema

      await interaction.reply({ embeds: [stealEmbed] });

    } else {
      const penaltyAmount = Math.floor(Math.random() * 100) + 50;
      await balances.updateOne({ userId: thief }, { $inc: { balance: -penaltyAmount } }, { upsert: true });
      
      stealEmbed
        .setTitle('Ops, Pega no Flag! 😱')
        .setDescription(`Você foi pega tentando roubar ${target.username}! Perdeu ${penaltyAmount} moedas como lição.`)
        .setImage('https://media.discordapp.net/attachments/1225569866254258190/1315318963831312466/giphy.gif?ex=6756f9be&is=6755a83e&hm=f114c7911fafe23a18d4bc440584dd8c2d7740ed20a16bb80f7c2ce56719f06e&='); // Substitua com uma URL de uma imagem que combine com o tema

      await interaction.reply({ embeds: [stealEmbed] });
    }

    await cooldowns.updateOne(
      { userId: thief, command: 'steal' }, 
      { $set: { timestamp: now } },
      { upsert: true }
    );
  },
};