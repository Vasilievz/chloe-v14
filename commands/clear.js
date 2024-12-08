const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Limpa as mensagens de um canal com estilo!')
    .addIntegerOption(option => 
      option.setName('quantidade')
        .setDescription('Quantas mensagens você quer que eu limpe? (Máximo de 100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: 'Desculpe, querida! Você precisa de permissão para gerenciar mensagens para fazer isso.', ephemeral: false });
    }

    const amount = interaction.options.getInteger('quantidade');

    try {
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      const deletedMessages = await interaction.channel.bulkDelete(messages, true);

      const clearEmbed = new EmbedBuilder()
        .setColor('#FFC0CB')
        .setTitle('Limpeza Completa! ✨')
        .setDescription(`Acabei de limpar ${deletedMessages.size} mensagens para você!`)
        .setThumbnail('https://media.discordapp.net/attachments/1225569866254258190/1315322370415656960/tenor.gif?ex=6756fcea&is=6755ab6a&hm=c7957adea673af89b57a02d960c3f734409058b13a413371a1d86861e7ba987e&=')
        .setFooter({ text: '💖 Bot de Economia de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

      await interaction.reply({ embeds: [clearEmbed], ephemeral: false });
      
    } catch (error) {
      console.error('Erro ao tentar limpar mensagens:', error);
      await interaction.reply({ content: 'Ops, algo deu errado ao tentar limpar as mensagens. Tente novamente mais tarde!', ephemeral: false });
    }
  },
};