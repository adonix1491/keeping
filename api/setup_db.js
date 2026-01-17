const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    try {
        // Create tables if they don't exist
        await sql`
            CREATE TABLE IF NOT EXISTS restaurants (
                id SERIAL PRIMARY KEY,
                company_id INTEGER NOT NULL,
                branch_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                booking_url TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(company_id, branch_id)
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                restaurant_id INTEGER REFERENCES restaurants(id),
                target_date DATE NOT NULL,
                party_size INTEGER NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Patch: Add line_user_id if missing
        try {
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255);`;
            console.log('Added line_user_id column');
        } catch (e) {
            console.log('line_user_id column check failed or exists:', e);
        }

        return res.status(200).json({ message: 'Database setup complete (Schema Patched)' });
    } catch (error) {
        return res.status(500).json({ error: String(error) });
    }
};
