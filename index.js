const { Client, Collection, GatewayIntentBits, REST, Routes, ActivityType, EmbedBuilder } = require('discord.js');
const { token, clientId, guildId, mongoURI } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const interactionCreateHandler = require('./interactionCreate.js');
const { MongoClient } = require('mongodb');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.data) client.commands.set(command.data.name, command);
  if (command.data) commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  } catch (error) {
    console.error(error);
  }
})();

let mongodb;

async function connectToDatabase() {
  const mongoClient = new MongoClient(mongoURI);
  await mongoClient.connect();
  mongodb = mongoClient.db('economyDB');
  client.mongodb = mongodb;
}

client.once('ready', async () => {
  await connectToDatabase();
  console.log(`Logged in como ${client.user.tag}!`);
  
  const statusMessages = [
    { type: ActivityType.Watching, name: 'Chloe\'s dream world' },
    { type: ActivityType.Playing, name: 'with my friends' },
    { type: ActivityType.Listening, name: 'to your wishes' },
    { type: ActivityType.Competing, name: 'in cuteness' },
    { type: ActivityType.Watching, name: 'over you' },
    { type: ActivityType.Playing, name: 'with magic' },
    { type: ActivityType.Competing, name: 'for the title of best bot' },
    { type: ActivityType.Playing, name: 'the role of a helper' }
  ];

  function setBotStatus() {
    const status = statusMessages[Math.floor(Math.random() * statusMessages.length)];
    client.user.setPresence({
      activities: [{ name: status.name, type: status.type }],
      status: 'online'
    });
    setTimeout(setBotStatus, 10000);
  }
  setBotStatus();

  client.on('messageCreate', async message => {
    if (!message.author.bot && message.mentions.has(client.user)) {
      const chloeEmbed = new EmbedBuilder()
        .setColor('#ff69b4')
        .setTitle(`**Olá @${message.author.username}! Eu sou Chloe!**`)
        .setDescription('Aqui para ajudar e espalhar alegria!')
        .addFields(
          { name: '💖 Como posso ajudar?', value: 'Posso conversar com você sobre qualquer coisa!', inline: false },
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: 'Chloe © 2024', iconURL: client.user.displayAvatarURL() });

      await message.channel.send({ embeds: [chloeEmbed] });
    }
  });
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Desculpe, algo deu errado com esse comando!', ephemeral: true });
    }
  } else {
    interactionCreateHandler.handle(client, interaction);
  }
});

client.login(token);
