require('dotenv').config()

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const davinciConfig = {
    model: "text-davinci-001",
        
        temperature: 1,
        max_tokens: 300,
        top_p: 1,
        echo: false,
        frequency_penalty: 0,
        presence_penalty: 0,
}


client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'summarize') {

    const allMessages = await interaction.channel.messages.fetch();
    const lastHour = allMessages.filter(msg => msg.createdTimestamp > Date.now() - (3600000 * 10));
    const transcript = (Array.from(lastHour.values())).map((msg, index, arr) => {
        if (msg.content.trim().length == 0) return;

        let lastAuthor;
        if (index + 1 < arr.length) lastAuthor = (Array.from(arr))[index + 1].author

        if (lastAuthor && lastAuthor.username == msg.author.username) {
            if (msg.content.trim().length > 0) return msg.content;
        }

        else return `${msg.author.username} - ${msg.content}`
    }).filter(chat => chat);

    console.log(transcript.reverse().join('\n'));
    if (lastHour.size == 0) return interaction.reply('There were no messages sent within the last hour.')
    
    interaction.deferReply()
    try {
    const response = await openai.createCompletion({
        ...davinciConfig,
        prompt: `Your task is to label the different conversation topics in the following set of text formatted as a chat log. You must pick out each seperate topic and display them in bullet point format. Do not add any excess text outside the bullet points\nConversation:\n\`\`\`${transcript.join('\n')}\n\`\`\`Summary: `,
    });
    
    const summary = response.data.choices[0].text;
    console.log(summary);
    //if (summary) interaction.editReply(`\`\`\`${JSON.stringify(davinciConfig)}\nPrompt: Your task is to label the different conversation topics in the following set of text formatted as a chat log. You must pick out each seperate topic and display them in bullet point format. Do not add any excess text outside the bullet points.\`\`\`\nDuring the past hour, there were ${lastHour.size} messages sent. Here is a summary of those messages: \n${summary}`);
    //else
    //interaction.editReply('random error LMAO')
    
} catch (e) {
    console.log(e);
}
}
});

client.login(process.env.DISCORD_TOKEN);