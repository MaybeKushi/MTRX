import { Telegraf } from 'telegraf';
import { exec } from 'child_process';
import vm from 'vm';

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
        return "Unknown"; 
    }
}

bot.command('eval', async (ctx) => {
    const command = ctx.message.text.split(' ').slice(1).join(' ');

    if (!command) {
        await ctx.reply('Please provide code to execute!');
        return;
    }

    try {
        const asyncEval = new Function('ctx', `
            return (async () => {
                ${command}
            })();
        `);

        const result = await asyncEval(ctx);
        await ctx.reply(`<b>EVAL :</b> <pre>${command}</pre>\n\n<b>OUTPUT :</b>\n<pre>${JSON.stringify(result)}</pre>`, { parse_mode: 'HTML' });
    } catch (err) {
        console.error(err);
        await ctx.reply(`Error:\n\`${err.message}\``);
    }
});

bot.command('exec', async (ctx) => {
    const command = ctx.message.text.split(' ').slice(1).join(' ');

    if (!command) {
        await ctx.reply('No input found!');
        return;
    }

    const processingMessage = await ctx.reply('`Processing...`', { parse_mode: 'Markdown' });

    exec(command, (error, stdout, stderr) => {
        let response = "";

        if (error) {
            response += `<b>ERROR :</b> <code>${error.message}</code>\n`;
        }

        if (stderr) {
            response += `<b>STDERR :</b> <code>${stderr.trim()}</code>\n`;
        }

        if (stdout) {
            response += `<b>STDOUT :</b> <code>${stdout.trim()}</code>\n`;
        }

        if (!response) {
            response = 'No output from command';
        }

        if (processingMessage && processingMessage.message_id) {
            try {
                bot.telegram.editMessageText(ctx.chat.id, processingMessage.message_id, null, response, {
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

    const shareLink = `https://telegram.me/share/url?url=Join%20the%20Matrix%20AI%20journey%20with%20me%20%21%20Dive%20into%20the%20future%20of%20crypto%20and%20AI%2C%20and%20start%20earning%20today.%20Use%20my%20link%20and%20be%20part%20of%20the%20revolution%20%21%0A%0AJoin%20Now%20%3A%20https%3A//telegram.me/MTRXAi_Bot/%3Fstart%3Dref_${userId}`;

    const inlineKeyboard = {
        inline_keyboard: [
            [{ text: "Play Now 🪂", web_app: { url: `https://mtx-ai-bot.vercel.app/?userId=${userId}` } }],
            [{ text: "Join Community 🔥", url: "https://telegram.me/MatrixAi_Ann" }],
            [{ text: "Share Link 📤", url: shareLink }]  // Added Share Link button
        ]
    };

    if (commandArgs && commandArgs.startsWith('ref_')) {
        const inviterId = commandArgs.split('ref_')[1];
        const inviterName = await getUsername(inviterId);
        const messageText = `${MATRIX_START_TEXT}\nInvited by: ${inviterName}`;

        await ctx.telegram.sendPhoto(chatId, "https://i.ibb.co/XDPzBWc/pngtree-virtual-panel-generate-ai-image-15868619.jpg", {
            caption: messageText,
            reply_markup: inlineKeyboard
        });

        await ctx.telegram.sendMessage(inviterId, `${ctx.from.username || ctx.from.first_name} Joined via your invite link!`);
    } else {
        await ctx.telegram.sendPhoto(chatId, "https://i.ibb.co/XDPzBWc/pngtree-virtual-panel-generate-ai-image-15868619.jpg", {
            caption: MATRIX_START_TEXT,
            reply_markup: inlineKeyboard
        });
    }
});

bot.command('referrals', async (ctx) => {
    const referralLink = `https://telegram.me/MTRXAi_Bot?start=ref_${ctx.from.id}`;
    await ctx.reply(`Here is your referral link: ${referralLink}`);
});

bot.launch();
console.log('Bot is running...');
