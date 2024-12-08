const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

const shopItems = [
  { id: 'pet1', name: 'Dragãozinho Fofo', price: 500, type: 'Pet' },
  { id: 'pet2', name: 'Unicórnio Mágico', price: 700, type: 'Pet' },
  { id: 'pet3', name: 'Gato Estelar', price: 300, type: 'Pet' },
  { id: 'pet1', name: 'Dragãozinho Fofo', price: 500, type: 'Pet' },
  { id: 'pet2', name: 'Unicórnio Mágico', price: 700, type: 'Pet' },
  { id: 'pet3', name: 'Gato Estelar', price: 300, type: 'Pet' }
];


module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Veja os itens disponíveis na loja de Vick Coins.'),
  async execute(interaction) {
    const shopEmbed = new EmbedBuilder()
      .setColor(0xFFB6C1)
      .setTitle('🛍️ Loja de Vick Coins')
      .setDescription('Aqui estão os itens disponíveis para compra:');

    shopItems.forEach(item => {
      shopEmbed.addFields({
        name: `${item.name} - ${item.price} Vick Coins`,
        value: `Tipo: ${item.type}`,
        inline: true
      });
    });

    await interaction.reply({ embeds: [shopEmbed], ephemeral: false });
  },
};