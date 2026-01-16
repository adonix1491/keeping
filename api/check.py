from http.server import BaseHTTPRequestHandler
import os
import requests
import sqlite3
import psycopg2
from urllib.parse import urlparse

# 環境變數
LINE_CHANNEL_ACCESS_TOKEN = os.environ.get('LINE_CHANNEL_ACCESS_TOKEN')
DATABASE_URL = os.environ.get('POSTGRES_URL') # Vercel Postgres usually provides this

def get_db_connection():
    if DATABASE_URL:
        # Use Postgres
        conn = psycopg2.connect(DATABASE_URL)
    else:
        # Fallback to local SQLite (Not persistent on Vercel!)
        conn = sqlite3.connect('waitlist.db')
    return conn

def check_inline_availability(company_id, branch_id, date, party_size):
    url = f"https://inline.app/api/companies/{company_id}/branches/{branch_id}/capacities?date={date}&partySize={party_size}"
    try:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            # 這裡簡化邏輯，真實情況需解析 JSON 結構
            # 假設 API 回傳 available: true 或類似結構
            # 這裡回傳模擬數據，若要真實運作需配合 Proxy
            return [] # ["18:00"] 
    except:
        pass
    return []

def push_line_notification(user_id, message):
    if not LINE_CHANNEL_ACCESS_TOKEN:
        print("Missing LINE Token")
        return
        
    url = "https://api.line.me/v2/bot/message/push"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LINE_CHANNEL_ACCESS_TOKEN}"
    }
    data = {
        "to": user_id,
        "messages": [{"type": "text", "text": message}]
    }
    requests.post(url, headers=headers, json=data)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        print("🚀 Cron Job Triggered")
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # 1. 撈出 PENDING 任務
            # 注意: table schema 需與資料庫一致
            query = "SELECT t.id, t.user_id, t.target_date, t.party_size, r.company_id, r.branch_id, r.booking_url FROM tasks t JOIN restaurants r ON t.restaurant_id = r.id WHERE t.status='PENDING'"
            cursor.execute(query)
            tasks = cursor.fetchall()
            
            results = []
            
            for task in tasks:
                task_id, uid, date, size, cid, bid, link = task
                
                # 2. 檢查空位
                slots = check_inline_availability(cid, bid, date, size)
                
                if slots:
                    msg = f"🔥 發現空位！\n日期：{date}\n時段：{slots}\n快搶：{link}"
                    push_line_notification(uid, msg)
                    
                    # 更新狀態
                    update_query = "UPDATE tasks SET status='FOUND' WHERE id=%s" if DATABASE_URL else "UPDATE tasks SET status='FOUND' WHERE id=?"
                    cursor.execute(update_query, (task_id,))
                    conn.commit()
                    results.append(f"Notified {uid}")
            
            cursor.close()
            conn.close()
            
            self.send_response(200)
            self.end_headers()
            self.wfile.write(f"Checked {len(tasks)} tasks. Results: {results}".encode())
            
        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
