// commands/chloe-ping.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chloe-ping')
    .setDescription('Verifica o ping e o status do bot Chloe.'),
  async execute(interaction) {
    const wsPing = interaction.client.ws.ping;
    const clientPing = Date.now() - interaction.createdTimestamp;
    
    const embed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle('Ping de Chloe')
      .setDescription('Aqui estão os detalhes do meu ping:')
      .addFields(
        { name: 'Ping WebSocket', value: `${wsPing} ms`, inline: true },
        { name: 'Ping Cliente', value: `${clientPing} ms`, inline: true },
        { name: 'Status', value: 'Operacional', inline: false },
        { name: 'Versão do Discord.js', value: require('discord.js').version, inline: true },
        { name: 'Uptime', value: `${Math.floor(interaction.client.uptime / (1000 * 60 * 60))}% horas`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Informações de Ping de Chloe' });

    interaction.reply({ 
      embeds: [embed], 
      ephemeral: false
    });
  },
};