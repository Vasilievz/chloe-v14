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
    .setName('buy')
    .setDescription('Comprar um item da loja.')
    .addStringOption(option => 
      option.setName('item')
        .setDescription('O ID do item que você quer comprar')
        .setRequired(true)
        .addChoices(...shopItems.map(item => ({ name: item.name, value: item.id })))),
  async execute(interaction) {
    const itemId = interaction.options.getString('item');
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return interaction.reply({ content: 'Item não encontrado.', ephemeral: true });

    const userId = interaction.user.id;
    const balances = interaction.client.mongodb.collection('balances');
    const inventory = interaction.client.mongodb.collection('inventory');

    const userBalance = await balances.findOne({ userId });
    if (!userBalance || userBalance.balance < item.price) {
      return interaction.reply({ content: 'Você não tem Vick Coins suficientes para comprar este item.', ephemeral: true });
    }

    await balances.updateOne({ userId }, { $inc: { balance: -item.price } });
    
    await inventory.updateOne(
      { userId },
      { $addToSet: { items: { id: item.id, name: item.name, type: item.type } } },
      { upsert: true }
    );

    await interaction.reply({ 
      content: `Parabéns! Você comprou **${item.name}** por **${item.price} Vick Coins**!`, 
      ephemeral: false 
    });
  },
};