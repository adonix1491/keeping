from http.server import BaseHTTPRequestHandler
import os
import psycopg2

# Vercel Postgres URL
DATABASE_URL = os.environ.get('POSTGRES_URL')

def setup_postgres():
    if not DATABASE_URL:
        return "❌ 尚未設定 POSTGRES_URL 環境變數"
        
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # 1. Create Restaurants Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS restaurants (
                id SERIAL PRIMARY KEY,
                company_id TEXT NOT NULL,
                branch_id TEXT NOT NULL,
                name TEXT NOT NULL,
                booking_url TEXT
            )
        ''')
        
        # 2. Create Tasks Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                restaurant_id INTEGER NOT NULL,
                target_date TEXT NOT NULL,
                party_size INTEGER NOT NULL,
                status TEXT DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
            )
        ''')
        
        # 3. Seed Preset Data (If empty)
        cursor.execute("SELECT count(*) FROM restaurants")
        count = cursor.fetchone()[0]
        
        if count == 0:
            presets = [
                {"name": "島語自助餐廳 台北漢來店", "url": "https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-NeqTStJZDIBQHEMSDI8"},
                {"name": "島語自助餐廳 高雄漢神店", "url": "https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-OUYVD5L8af9l-fOxBi5"},
                {"name": "島語自助餐廳 桃園台茂店", "url": "https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-OfXjSw3386qiY1yTpOZ"},
                {"name": "fumée Yakitori 本店", "url": "https://inline.app/booking/-NdcVTihF03AzdgpS38Q:inline-live-3/-NdcVTuhlCqT4WfSAaUm"},
                {"name": "AKAME 本店", "url": "https://inline.app/booking/-LzoDiSgrwoz1PHLtibz:inline-live-1/-LzoDjNruO8RBsVIMQ9W"},
                {"name": "詹記麻辣火鍋 敦南店", "url": "https://inline.app/booking/-KO9-zyZTRpTH7LNAe99/-LOcon_dHjl7H4_PR39w"},
                {"name": "詹記麻辣火鍋 新莊總店", "url": "https://inline.app/booking/-KO9-zyZTRpTH7LNAe99/-KO9-zyZTRpTH7LNAe9A"},
                {"name": "屋馬燒肉 中港店", "url": "https://inline.app/booking/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma/-KbyW5SxxkVi6Bf3dk8X"},
                {"name": "屋馬燒肉 文心店", "url": "https://inline.app/booking/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma/-KbyW5SmQykgA3BRcyCF"},
                {"name": "Mathariri 本店", "url": "https://inline.app/booking/-MW5LEBQ8Wkn308HkJZD:inline-live-2/-MW5LEJ0qvn9Xc5-azxz"},
                {"name": "漢來海港 高雄漢來店", "url": "https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZH-xfUSdEozfSeH4dk"},
                {"name": "漢來海港 高雄漢神巨蛋店", "url": "https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZMQIyR-XSNcmtWFhQa"},
                {"name": "漢來海港 台北天母SOGO店", "url": "https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZY7xXP5cU_rBCfm0HP"},
                {"name": "挽肉と米 華山店", "url": "https://inline.app/booking/-N_1xDQeMXaa3du_tCti:inline-live-3"},
                {"name": "挽肉と米 信義店", "url": "https://inline.app/booking/-N_1xDQeMXaa3du_tCti:inline-live-3/-OF2BPF7euiO9DQ0WJbt"},
                {"name": "興蓬萊台菜 中山北路創始店", "url": "https://inline.app/booking/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2/-MhvwcJZa51GNd1tunpV"},
                {"name": "興蓬萊台菜 大葉高島屋旗艦店", "url": "https://inline.app/booking/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2/-NUeidn-dQnkyI7PxmDD"},
                {"name": "金豬食堂 台北店", "url": "https://inline.app/booking/-OP3RPkD3dPc7GzBlZx8:inline-live-3/-OP3RPuOlbzd5GAxzLfe"},
            ]
            
            for r in presets:
                try:
                    parts = r["url"].split('/booking/')
                    if len(parts) > 1:
                        ids = parts[1].split('/')
                        if len(ids) >= 2:
                            cid = ids[0]
                            bid = ids[1].split('?')[0]
                            cursor.execute("INSERT INTO restaurants (company_id, branch_id, name, booking_url) VALUES (%s, %s, %s, %s)", 
                                           (cid, bid, r["name"], r["url"]))
                except Exception as e:
                    print(f"Skipped {r['name']}: {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        return f"✅ Database initialized! (Restaruants: {count if count > 0 else len(presets)})"
        
    except Exception as e:
        return f"❌ DB Error: {str(e)}"

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        result = setup_postgres()
        self.send_response(200)
        self.end_headers()
        self.wfile.write(result.encode('utf-8'))
