const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Obtém a previsão do tempo para uma cidade')
    .addStringOption(option => 
      option.setName('city')
        .setDescription('Nome da cidade para verificar o clima')
        .setRequired(true)),
  async execute(interaction) {
    const city = interaction.options.getString('city');
    const url = `http://wttr.in/${encodeURIComponent(city)}?format=j1`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.error) {
        return interaction.reply({ content: `Não foi possível encontrar clima para ${city}.`, ephemeral: true });
      }

      const currentWeather = data.current_condition[0];
      const weatherEmbed = new EmbedBuilder()
        .setColor(0xFFB6C1)
        .setTitle(`Clima em ${data.nearest_area[0].areaName[0].value}`)
        .setDescription(currentWeather.weatherDesc[0].value)
        .addFields(
          { name: 'Temperatura', value: `${currentWeather.temp_C}°C`, inline: true },
          { name: 'Sensação Térmica', value: `${currentWeather.FeelsLikeC}°C`, inline: true },
          { name: 'Umidade', value: `${currentWeather.humidity}%`, inline: true },
          { name: 'Velocidade do Vento', value: `${currentWeather.windspeedKmph} km/h`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Clima Mágico de Chloe', iconURL: interaction.client.user.displayAvatarURL() });

      await interaction.reply({ embeds: [weatherEmbed], ephemeral: false });
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
      await interaction.reply({ content: 'Ocorreu um erro ao obter informações do clima. Tente novamente mais tarde.', ephemeral: true });
    }
  },
};