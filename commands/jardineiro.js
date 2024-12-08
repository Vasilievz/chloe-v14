const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { flowers } = require('../constants.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jardineiro')
        .setDescription('Trabalhe como jardineiro para coletar flores!'),
    async execute(interaction) {
        const { mongodb } = interaction.client;
        const inventory = mongodb.collection('inventory');
        const userId = interaction.user.id;

        const totalRarity = flowers.reduce((sum, flower) => sum + flower.rarity, 0);
        const random = Math.random() * totalRarity;
        let currentSum = 0;
        let foundFlower;

        for (let flower of flowers) {
            currentSum += flower.rarity;
            if (random <= currentSum) {
                foundFlower = flower;
                break;
            }
        }

        await inventory.updateOne(
            { userId },
            { $addToSet: { items: { id: foundFlower.id, name: foundFlower.name, type: 'Flor' } } },
            { upsert: true }
        );

        const gardenEmbed = new EmbedBuilder()
            .setColor('#FFB6C1')
            .setTitle('🌺 **Você Colheu uma Flor Magnífica!** 🌺')
            .setDescription(`Parabéns! Após um trabalho árduo como jardineiro(a), você encontrou uma flor rara: **${foundFlower.name}**.`)
            .addFields(
                { name: '💰 Valor', value: `${foundFlower.value} Vick Coins`, inline: true },
                { name: '🌟 Raridade', value: `${foundFlower.rarity}%`, inline: true }
            )
            .setImage('https://media.discordapp.net/attachments/1225569866254258190/1315363953869717656/sakura-kinomoto-anime-blooming-flowers-9sffvehcydr1lx21.gif?ex=675723a4&is=6755d224&hm=b95c6a33494b9222a2a2d0dd6c168899f4d298174790159615c24cea23af4b22&=/qVWtC2u.png')
            .setFooter({
                text: '🌼 Cultive mais flores e encha seu jardim de tesouros!',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [gardenEmbed], ephemeral: false });
    },
};
