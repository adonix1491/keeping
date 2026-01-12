import time
import requests
import sqlite3
from datetime import datetime

# 設定 LINE API Token
LINE_CHANNEL_ACCESS_TOKEN = "YOUR_TOKEN"

def check_inline_availability(company_id, branch_id, date, party_size):
    """
    呼叫 Inline API (建議配合 Proxy 使用)
    """
    url = f"https://inline.app/api/companies/{company_id}/branches/{branch_id}/capacities?date={date}&partySize={party_size}"
    # headers 必須模擬真實瀏覽器
    try:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0..."}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            # 解析 JSON 邏輯 (同前幾次對話)
            # 若有 available: true 回傳時段列表
            return ["18:00", "18:30"] # 範例回傳
    except:
        pass
    return []

def push_line_notification(user_id, message):
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

def worker_loop():
    print("🚀 監控工人啟動...")
    while True:
        conn = sqlite3.connect('waitlist.db')
        cursor = conn.cursor()
        
        # 1. 撈出所有 PENDING 任務
        cursor.execute("SELECT t.id, t.user_id, t.target_date, t.party_size, r.company_id, r.branch_id, r.booking_url FROM tasks t JOIN restaurants r ON t.restaurant_id = r.id WHERE t.status='PENDING'")
        tasks = cursor.fetchall()
        
        for task in tasks:
            task_id, uid, date, size, cid, bid, link = task
            
            # 2. 檢查空位
            slots = check_inline_availability(cid, bid, date, size)
            
            if slots:
                # 3. 發現空位 -> 推播 -> 更新狀態
                msg = f"🔥 發現空位！\n日期：{date}\n時段：{slots}\n快搶：{link}"
                push_line_notification(uid, msg)
                
                print(f"User {uid} 通知已發送")
                
                # 更新為 FOUND (或保留 PENDING 但冷卻一段時間)
                cursor.execute("UPDATE tasks SET status='FOUND' WHERE id=?", (task_id,))
                conn.commit()
            
            # 避免請求過快 (Rate Limiting)
            time.sleep(30) 
        
        conn.close()
        time.sleep(60) # 每一輪休息 60 秒

if __name__ == "__main__":
    worker_loop()
