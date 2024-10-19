import string
import random
import sqlite3
from pyrogram import filters
from pyrogram.client import Client
from pyrogram.types import Message
from pyrogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

conn = sqlite3.connect("referrals.db")
cursor = conn.cursor()

MATRIX_START_TEXT = """
Want to know how cool your Telegram presence is ? 
Check your profile rating and unlock awesome rewards with $MTRX Matrix AI !

Time to vibe ✨ and step into the world of Web3.
$MTRX is on the way... Ready to explore something new ?

Take the first step and see just how you stack up !
"""

cursor.execute('''CREATE TABLE IF NOT EXISTS referrals (
    user_id INTEGER PRIMARY KEY,
    invite_code TEXT,
    invited_by INTEGER
)''')

async def save_referral(user_id, invite_code, invited_by=None):
    cursor.execute("INSERT OR REPLACE INTO referrals (user_id, invite_code, invited_by) VALUES (?, ?, ?)", (user_id, invite_code, invited_by))
    conn.commit()

async def get_user_id_by_invite_code(invite_code):
    cursor.execute("SELECT user_id FROM referrals WHERE invite_code = ?", (invite_code,))
    result = cursor.fetchone()
    return result[0] if result else None

async def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

async def get_username(app, userId):
    user = await app.get_users(userId)
    return user.mention if user.mention else "Unknown"
    
@app.on_message(filters.command("start"))
async def startFuncs(app:Client, message:Message) -> None:
    user_id = message.from_user.id
    if len(message.command) > 1:
        start_param = message.command[1]
        if start_param.startswith("user_"):
            invite_code = start_param.split('user_')[-1]
            inviter_id = await get_user_id_by_invite_code(invite_code)
            
            if inviter_id:
                await save_referral(user_id, None, inviter_id)
                inviter_name = await get_username(app, inviter_id)
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
                await app.send_message(inviter_id, f"{msg.from_user.mention} Joined via your invited link !")
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


      
        
        await message.reply(f"Welcome! Share your invite link: https://telegram.me/YOUR_BOT_USERNAME?start=invitedBy_{invite_code}")



invite_code = generate_invite_code()
        save_referral(user_id, invite_code)

app.run()
