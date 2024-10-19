from app import *
from pyrogram import filters
from pyrogram.client import Client
from pyrogram.types import Message
from pyrogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

AppId = 29400566
AppHash = "8fd30dc496aea7c14cf675f59b74ec6f"
AppToken = "7646877814:AAFx-LjNMqIqzLs-30pTwM_vVrV0w5DHDLA"
app2 = Client("MATRIX_AI", api_id=AppId, api_hash=AppHash, bot_token=AppToken)

@app2.on_message(filters.command("start"))
async def startFuncs(app2:Client, message:Message) -> None:
    user_id = message.from_user.id
    if len(message.command) > 1:
        start_param = message.command[1]
        if start_param.startswith("user_"):
            invite_code = start_param.split('user_')[-1]
            inviter_id = await get_user_id_by_invite_code(invite_code)
            
            if inviter_id:
                save_referral(user_id, None, inviter_id)
                inviter_name = await get_username(app2, inviter_id)
                InlineKeyboard = InlineKeyboardMarkup([
                    [InlineKeyboardButton("Play Now 🪂", web_app=WebAppInfo(url=f"https://mtx-ai-bot.vercel.app/invited?id={user_id}&by={inviter_id}"))],
                    [InlineKeyboardButton("Join Community 🔥", url="https://telegram.me/MatrixAi_Ann")]
                ])
                MessageText = f"{MATRIX_START_TEXT}\n\nInvited by: {inviter_name}"
                await message.reply_photo(
                    photo="https://i.ibb.co/XDPzBWc/pngtree-virtual-panel-generate-ai-image-15868619.jpg",
                    text=MessageText,
                    reply_markup=InlineKeyboard
                )
                await app2.send_message(inviter_id, f"{msg.from_user.mention} Joined via your invited link !")
    else:
        InlineKeyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("Play Now 🪂", web_app=WebAppInfo(url=f"https://mtx-ai-bot.vercel.app"))],
            [InlineKeyboardButton("Join Community 🔥", url="https://telegram.me/MatrixAi_Ann")]
        ])
        await message.reply_photo(
            photo="https://i.ibb.co/XDPzBWc/pngtree-virtual-panel-generate-ai-image-15868619.jpg",
            text=MATRIX_START_TEXT,
            reply_markup=InlineKeyboard
        )

app2.run()
