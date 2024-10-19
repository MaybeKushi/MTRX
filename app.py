import string
import random
import sqlite3
from pyrogram import filters
from pyrogram.client import Client
from pyrogram.types import Message

conn = sqlite3.connect("referrals.db")
cursor = conn.cursor()

