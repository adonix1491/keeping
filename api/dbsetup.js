const { sql } = require('@vercel/postgres');

// This script sets up the complete database schema for the availability scraping system
module.exports = async (req, res) => {
    try {
        let logs = [];
        logs.push('Starting Schema Setup for Availability Scraping System...');

        // 1. Create availability_cache table if not exists
        await sql`
            CREATE TABLE IF NOT EXISTS availability_cache (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                time_slot VARCHAR(10) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
                has_inline_waitlist BOOLEAN DEFAULT FALSE,
                last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(restaurant_id, date, time_slot)
            )
        `;
        logs.push('Created availability_cache table.');

        // 2. Add new columns to tasks table if not exist
        try {
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_checked TIMESTAMP WITH TIME ZONE`;
            logs.push('Added last_checked column to tasks.');
        } catch (e) {
            logs.push('last_checked column already exists or error: ' + e.message);
        }

        try {
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS check_count INTEGER DEFAULT 0`;
            logs.push('Added check_count column to tasks.');
        } catch (e) {
            logs.push('check_count column already exists or error: ' + e.message);
        }

        try {
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE`;
            logs.push('Added notified column to tasks.');
        } catch (e) {
            logs.push('notified column already exists or error: ' + e.message);
        }

        try {
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS target_time VARCHAR(10)`;
            logs.push('Added target_time column to tasks.');
        } catch (e) {
            logs.push('target_time column already exists or error: ' + e.message);
        }

        // 3. Create index for faster queries
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_availability_cache_lookup 
                      ON availability_cache(restaurant_id, date, time_slot)`;
            logs.push('Created index on availability_cache.');
        } catch (e) {
            logs.push('Index creation error: ' + e.message);
        }

        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_tasks_pending 
                      ON tasks(status, notified) WHERE status = 'PENDING' AND notified = FALSE`;
            logs.push('Created index on tasks for pending monitoring.');
        } catch (e) {
            logs.push('Tasks index creation error: ' + e.message);
        }

        return res.status(200).json({
            message: 'Schema Setup Complete',
            logs: logs
        });
    } catch (error) {
        return res.status(500).json({ error: String(error), stack: error.stack });
    }
};
