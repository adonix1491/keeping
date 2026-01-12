import sqlite3
import sys

def add_restaurant(name, url):
    """
    Parses an Inline booking URL to extract company_id and branch_id,
    then adds the restaurant to the database.
    """
    try:
        # Parse URL: .../booking/{company_id}/{branch_id}
        parts = url.split('/booking/')
        if len(parts) > 1:
            ids = parts[1].split('/')
            if len(ids) >= 2:
                company_id = ids[0]
                branch_id = ids[1].split('?')[0] # Remove query params
                
                print(f"Parsed IDs - Company: {company_id}, Branch: {branch_id}")
                
                conn = sqlite3.connect('waitlist.db')
                cursor = conn.cursor()
                
                # Check if exists
                cursor.execute("SELECT id FROM restaurants WHERE company_id=? AND branch_id=?", (company_id, branch_id))
                existing = cursor.fetchone()
                
                if existing:
                    print(f"Restaurant already exists with ID: {existing[0]}")
                else:
                    cursor.execute("INSERT INTO restaurants (company_id, branch_id, name, booking_url) VALUES (?, ?, ?, ?)", 
                                   (company_id, branch_id, name, url))
                    conn.commit()
                    print(f"Successfully added '{name}' to database!")
                
                conn.close()
            else:
                print("Error: Could not extract Branch ID from URL.")
        else:
            print("Error: Invalid Inline URL format. Must contain '/booking/'.")
            
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python backend/add_restaurant.py \"Restaurant Name\" \"Inline_URL\"")
        print("Example: python backend/add_restaurant.py \"Tasty Pot\" \"https://inline.app/booking/company/branch\"")
    else:
        add_restaurant(sys.argv[1], sys.argv[2])
