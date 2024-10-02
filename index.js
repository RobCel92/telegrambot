require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

let delay = 30; // Default delay in seconds

// Command to set delay
bot.command('setdelay', (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    const newDelay = parseInt(args[0], 10);
    const validDelays = [12, 30, 45, 60];

    if (validDelays.includes(newDelay)) {
        delay = newDelay;
        ctx.reply(`Delay set to ${delay} seconds.`);
    } else {
        ctx.reply(`Invalid delay. Please choose from: ${validDelays.join(', ')} seconds.`);
    }
});

// Command to check bot status
bot.command('status', (ctx) => {
    ctx.reply(`Bot is running with a delay of ${delay} seconds.`);
});

// Function to handle new member joining
bot.on('new_chat_members', async (ctx) => {
    const newMembers = ctx.message.new_chat_members;
    for (const member of newMembers) {
        console.log(`New member joined: ${member.first_name}`);

        // Delete the welcome message after the specified delay
        await new Promise(resolve => setTimeout(resolve, delay * 1000));

        try {
            await ctx.deleteMessage(ctx.message.message_id);
            console.log('Deleted the new member join message.');
        } catch (error) {
            console.error('Failed to delete the join message:', error);
        }

        // Set a one-time listener for the next message from specific users
        const chatId = ctx.chat.id;

        const nextMessageHandler = async (nextMessageCtx) => {
            if (nextMessageCtx.chat.id === chatId) {
                const senderUsername = nextMessageCtx.from.username;

                if (senderUsername === 'SafeguardRobot' || senderUsername === 'MissRose_bot' || nextMessageCtx.from.is_admin) {
                    try {
                        await nextMessageCtx.delete(); // Delete the next message
                        console.log('Deleted the next message from a bot/admin.');
                    } catch (error) {
                        console.error('Failed to delete the message:', error);
                    }
                    // Unregister this listener after processing the next message
                    bot.off('message', nextMessageHandler);
                }
            }
        };

        // Register the one-time listener for the next message
        bot.on('message', nextMessageHandler);
    }
});

// Start the bot
bot.launch().then(() => {
    console.log('Bot is running...');
}).catch(err => {
    console.error('Error launching bot:', err);
});
