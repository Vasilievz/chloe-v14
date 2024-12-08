const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Mostra todos os comandos disponíveis do bot.'),
  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle('Comandos de Chloe')
      .setDescription('Aqui está uma lista de todos os comandos que você pode usar com Chloe. Use-os sabiamente para explorar todas as funcionalidades do bot!')
      .setImage('https://media.discordapp.net/attachments/1225569866254258190/1315198755015757824/nami-excited-yay-sparkle-8rm20mrmguvb8gyd.gif?ex=675689ca&is=6755384a&hm=7cbdf611c88210e3da95c2d5462dc3c7bded9d917ac8c2c2251b8e71dcb378f6&=')
      .addFields(
        { name: '/balance', value: 'Verifique seu saldo de Vick Coins.', inline: true },
        { name: '/bet', value: 'Faça apostas com suas Vick Coins em um jogo de azar.', inline: true },
        { name: '/buy', value: 'Compre itens exclusivos usando suas Vick Coins.', inline: true },
        { name: '/chloe-ping', value: 'Teste a latência da Chloe.', inline: true },
        { name: '/daily', value: 'Reivindique seu bônus diário de Vick Coins.', inline: true },
        { name: '/give', value: 'Doe Vick Coins para outro usuário.', inline: true },
        { name: '/inventory', value: 'Veja quais itens você possui.', inline: true },
        { name: '/leaderboard', value: 'Confira quem são os mais ricos em Vick Coins.', inline: true },
        { name: '/ship', value: 'Calcule a compatibilidade entre dois usuários.', inline: true },
        { name: '/shop', value: 'Explore a loja de itens disponíveis para compra.', inline: true },
        { name: '/weather', value: 'Obtenha a previsão do tempo para qualquer lugar.', inline: true },
        { name: '/week', value: 'Pegue seus Vick Coins semanais', inline: true },
        { name: '/work', value: 'Trabalhe para ganhar Vick Coins.', inline: true }
      )
      .setFooter({ text: 'Desenvolvido por Vasiliev', iconURL: 'https://media.discordapp.net/attachments/1225569866254258190/1315198929293414481/R.gif?ex=675689f3&is=67553873&hm=6b1c43163ff04f4f7ab991685e182404314ea62efdf1b27dcf7d1a4487538e70&=' })
      .setTimestamp();

    await interaction.reply({ embeds: [helpEmbed] });
  },
};