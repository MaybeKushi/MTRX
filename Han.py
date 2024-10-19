import sqlite3
import random
import string
from pyrogram import Client, filters
from pyrogram.types import Message

# Initialize SQLite connection
conn = sqlite3.connect("referrals.db")
cursor = conn.cursor()

# Create table if it doesn't exist
cursor.execute('''CREATE TABLE IF NOT EXISTS referrals (
    user_id INTEGER PRIMARY KEY,
    invite_code TEXT,
    invited_by INTEGER
)''')

# Function to create or update a referral entry
def save_referral(user_id, invite_code, invited_by=None):
    cursor.execute("INSERT OR REPLACE INTO referrals (user_id, invite_code, invited_by) VALUES (?, ?, ?)", (user_id, invite_code, invited_by))
    conn.commit()

# Function to get user_id from invite code
def get_user_id_by_invite_code(invite_code):
    cursor.execute("SELECT user_id FROM referrals WHERE invite_code = ?", (invite_code,))
    result = cursor.fetchone()
    return result[0] if result else None

# Initialize the Telegram Bot
app = Client("my_bot", api_id="YOUR_API_ID", api_hash="YOUR_API_HASH", bot_token="YOUR_BOT_TOKEN")

# Generate a random invite code
def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

@app.on_message(filters.command("start"))
async def start(client: Client, message: Message):
    user_id = message.from_user.id

    # Check if the message has an invite code in the format /start=invitedBy_{code}
    if len(message.command) > 1:
        start_param = message.command[1]
        
        if start_param.startswith("invitedBy_"):
            invite_code = start_param.split('invitedBy_')[-1]
            inviter_id = get_user_id_by_invite_code(invite_code)
            
            if inviter_id:
                # Save referral data with invited_by
                save_referral(user_id, None, inviter_id)
                await message.reply(f"Welcome! You were invited by {inviter_id}")
            else:
                await message.reply("Invalid invite code.")
        else:
            await message.reply("Invalid start parameter.")
    else:
        # If no invite code, generate one for the user
        invite_code = generate_invite_code()
        save_referral(user_id, invite_code)
        await message.reply(f"Welcome! Share your invite link: https://telegram.me/YOUR_BOT_USERNAME?start=invitedBy_{invite_code}")

# Start the bot
app.run()
