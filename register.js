require('dotenv').config()

const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN;

const commands = [
  {
    name: 'summarize',
    description: `summarize the channel's messages from the past hour`,
  },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands('1064764097104723998'), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

