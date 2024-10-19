import string
import random
import sqlite3

conn = sqlite3.connect("referrals.db", check_same_thread=False)
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

def save_referral(user_id, invite_code, invited_by=None):
    cursor.execute("INSERT OR REPLACE INTO referrals (user_id, invite_code, invited_by) VALUES (?, ?, ?)", (user_id, invite_code, invited_by))
    conn.commit()
    conn.close()

async def get_user_id_by_invite_code(invite_code):
    cursor.execute("SELECT user_id FROM referrals WHERE invite_code = ?", (invite_code,))
    result = cursor.fetchone()
    return result[0] if result else None

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

async def get_username(app, userId):
    user = await app.get_users(userId)
    return user.mention if user.mention else "Unknown"

from flask import Flask
from flask import request
from flask import jsonify

app = Flask(__name__)

@app.route('/link', methods=['GET'])
def get_Referral_Link():
    users = request.args.get('user')
    if not users:
        return jsonify({"error": "User ID Is Required !"}), 400
    
    Invite_Code = generate_invite_code()
    save_referral(users, Invite_Code)
    Referral_Link = f"https://telegram.me/MTRXAi_Bot?start=user_{Invite_Code}"
    return jsonify({"message": Referral_Link})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
