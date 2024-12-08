const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const choices = ['pedra', 'papel', 'tesoura'];

function getResult(playerChoice, botChoice) {
  if (playerChoice === botChoice) return 'empate';
  if (
    (playerChoice === 'pedra' && botChoice === 'tesoura') ||
    (playerChoice === 'papel' && botChoice === 'pedra') ||
    (playerChoice === 'tesoura' && botChoice === 'papel')
  ) {
    return 'vitória';
  }
  return 'derrota';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Jogue Pedra, Papel ou Tesoura contra Chloe para ganhar Vick Coins!')
    .addStringOption(option => 
      option.setName('choice')
        .setDescription('Escolha sua jogada')
        .setRequired(true)
        .addChoices(
          { name: 'Pedra', value: 'pedra' },
          { name: 'Papel', value: 'papel' },
          { name: 'Tesoura', value: 'tesoura' }
        ))
    .addIntegerOption(option => 
      option.setName('bet')
        .setDescription('Quantidade de Vick Coins para apostar')
        .setRequired(true)
        .setMinValue(1)),
  async execute(interaction) {
    const playerChoice = interaction.options.getString('choice');
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const betAmount = interaction.options.getInteger('bet');
    const userId = interaction.user.id;

    const balances = interaction.client.mongodb.collection('balances');

    const userBalance = await balances.findOne({ userId });
    if (!userBalance || userBalance.balance < betAmount) {
      return interaction.reply({ content: 'Você não tem Vick Coins suficientes para essa aposta.', ephemeral: true });
    }

    const result = getResult(playerChoice, botChoice);
    let newBalance = userBalance.balance;

    switch (result) {
      case 'vitória':
        newBalance += betAmount;
        break;
      case 'derrota':
        newBalance -= betAmount;
        break;
    }

    await balances.updateOne(
      { userId },
      { $set: { balance: newBalance } }
    );

    const rpsEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle('✊✋✌️ Pedra, Papel ou Tesoura')
      .addFields(
        { name: `${interaction.user.username} escolheu`, value: playerChoice, inline: true },
        { name: 'Chloe escolheu', value: botChoice, inline: true }
      )
      .setDescription(result === 'empate' ? 'Foi um empate!' : 
                      result === 'vitória' ? `**Você venceu!** Ganhou **${betAmount}** Vick Coins!` : `**Chloe venceu!** Perdeu **${betAmount}** Vick Coins!`)
      .addFields({ name: 'Novo Saldo', value: `**${newBalance}** Vick Coins`, inline: false })
      .setTimestamp()
      .setFooter({ text: 'Economia Mágica de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [rpsEmbed], ephemeral: false });
  },
};