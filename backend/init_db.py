import sqlite3

def init_db():
    conn = sqlite3.connect('waitlist.db')
    cursor = conn.cursor()
    
    # 1. Create restaurants table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS restaurants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id TEXT NOT NULL,
            branch_id TEXT NOT NULL,
            name TEXT NOT NULL,
            booking_url TEXT
        )
    ''')
    
    # 2. Create tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            restaurant_id INTEGER NOT NULL,
            target_date TEXT NOT NULL,
            party_size INTEGER NOT NULL,
            status TEXT DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
        )
    ''')
    
    # Optional: Insert some dummy data for testing
    cursor.execute("SELECT count(*) FROM restaurants")
    if cursor.fetchone()[0] == 0:
        print("Seeding preset restaurants...")
        presets = [
            {"id": 1, "name": "尚石苑石頭火鍋 (太平店)", "url": "https://inline.app/booking/-ML2ClCSWqvYXVKATF3k/-ORZoK_x9823z1fLmVvO"},
            {"id": 2, "name": "島語自助餐廳 (Island Buffet)", "url": "https://inline.app/booking/-NeqTSgDQOAYi3Olg4a7/-NeqTSgDQOAYi3Olg4a8"},
            {"id": 3, "name": "旭集 和食集錦 (信義店)", "url": "https://inline.app/booking/-Lxz.../-LxzBranch..."},
        ]
        
        for r in presets:
            try:
                # Parse URL: .../booking/{company_id}/{branch_id}
                parts = r["url"].split('/booking/')
                if len(parts) > 1:
                    ids = parts[1].split('/')
                    if len(ids) >= 2:
                        cid = ids[0]
                        bid = ids[1].split('?')[0]
                        cursor.execute("INSERT INTO restaurants (company_id, branch_id, name, booking_url) VALUES (?, ?, ?, ?)", 
                                       (cid, bid, r["name"], r["url"]))
            except Exception as e:
                print(f"Error parsing {r['name']}: {e}")
        
    cursor.execute("SELECT count(*) FROM tasks")
    if cursor.fetchone()[0] == 0:
        print("Inserting dummy task...")
        cursor.execute("INSERT INTO tasks (user_id, restaurant_id, target_date, party_size, status) VALUES (?, ?, ?, ?, ?)", 
                       ('U12345678', 1, '2023-12-31', 2, 'PENDING'))
    
    conn.commit()
    conn.close()
    print("Database initialized successfully: waitlist.db")

if __name__ == "__main__":
    init_db()
