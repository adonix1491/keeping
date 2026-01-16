from http.server import BaseHTTPRequestHandler
import os
import json
import sqlite3
import psycopg2
from urllib.parse import urlparse

# Reuse logic? ideally import, but for serverless single file is safer or use shared module
DATABASE_URL = os.environ.get('POSTGRES_URL')

def get_db_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return sqlite3.connect('waitlist.db')

def parse_inline_url(url):
    try:
        # https://inline.app/booking/{company_id}/{branch_id}
        parts = url.split('/booking/')
        if len(parts) > 1:
            ids = parts[1].split('/')
            if len(ids) >= 2:
                cid = ids[0]
                bid = ids[1].split('?')[0]
                return cid, bid
    except:
        pass
    return None, None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            user_id = data.get('userId')
            booking_url = data.get('bookingUrl')
            target_date = data.get('targetDate')
            party_size = data.get('partySize')
            
            if not user_id or not booking_url:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Missing required fields")
                return

            cid, bid = parse_inline_url(booking_url)
            if not cid:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Invalid Booking URL")
                return

            conn = get_db_connection()
            cursor = conn.cursor()
            
            # 1. Ensure Restaurant Exists
            # Check by branch_id
            query_check = "SELECT id FROM restaurants WHERE branch_id = %s" if DATABASE_URL else "SELECT id FROM restaurants WHERE branch_id = ?"
            cursor.execute(query_check, (bid,))
            row = cursor.fetchone()
            
            if row:
                restaurant_id = row[0]
            else:
                # Insert new
                query_ins = "INSERT INTO restaurants (company_id, branch_id, name, booking_url) VALUES (%s, %s, %s, %s) RETURNING id" if DATABASE_URL else "INSERT INTO restaurants (company_id, branch_id, name, booking_url) VALUES (?, ?, ?, ?)"
                
                if DATABASE_URL:
                     cursor.execute(query_ins, (cid, bid, "Unknown", booking_url))
                     restaurant_id = cursor.fetchone()[0]
                else:
                     cursor.execute(query_ins, (cid, bid, "Unknown", booking_url))
                     restaurant_id = cursor.lastrowid
            
            # 2. Insert Task
            query_task = "INSERT INTO tasks (user_id, restaurant_id, target_date, party_size, status) VALUES (%s, %s, %s, %s, 'PENDING')" if DATABASE_URL else "INSERT INTO tasks (user_id, restaurant_id, target_date, party_size, status) VALUES (?, ?, ?, ?, 'PENDING')"
            cursor.execute(query_task, (user_id, restaurant_id, target_date, party_size))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode())
            
        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
