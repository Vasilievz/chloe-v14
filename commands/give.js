const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Dê Vick Coins para outro usuário.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('O usuário para quem você quer dar Vick Coins')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('A quantidade de Vick Coins para dar')
        .setRequired(true)
        .setMinValue(1)),
  async execute(interaction) {
    const recipient = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const senderId = interaction.user.id;
    const recipientId = recipient.id;

    const balances = interaction.client.mongodb.collection('balances');

    const senderBalance = await balances.findOne({ userId: senderId });
    if (!senderBalance || senderBalance.balance < amount) {
      return interaction.reply({ content: 'Você não tem Vick Coins suficientes para fazer essa transferência.', ephemeral: true });
    }

    try {
      await balances.updateOne(
        { userId: senderId },
        { $inc: { balance: -amount } }
      );
      
      await balances.updateOne(
        { userId: recipientId },
        { $inc: { balance: amount } },
        { upsert: true }
      );

      const giveEmbed = new EmbedBuilder()
        .setColor(0xFFB6C1)
        .setTitle('🔄 Transferência de Vick Coins')
        .setDescription(`**${interaction.user.username}** deu **${amount} Vick Coins** para **${recipient.username}**!`)
        .setTimestamp()
        .setFooter({ text: 'Economia Mágica de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

      await interaction.reply({ embeds: [giveEmbed], ephemeral: false });
    } catch (error) {
      console.error('Erro na transferência:', error);
      await interaction.reply({ content: 'Ocorreu um erro na transferência. Tente novamente.', ephemeral: true });
    }
  },
};