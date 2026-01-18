const { sql } = require('@vercel/postgres');

/**
 * 資料庫遷移 - 新增缺失的資料表和欄位
 * 此腳本只新增表和欄位，不會刪除或重置現有資料
 */
module.exports = async (req, res) => {
    try {
        const logs = [];
        logs.push('Starting database migration...');

        // 1. 創建 users 資料表（如果不存在）
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                device_id VARCHAR(255) UNIQUE NOT NULL,
                line_user_id VARCHAR(255) UNIQUE,
                email VARCHAR(255) UNIQUE,
                points INTEGER DEFAULT 0,
                line_bound_at TIMESTAMP WITH TIME ZONE,
                email_bound_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;
        logs.push('Created users table (if not exists).');

        // 2. 創建 availability_cache 資料表（如果不存在）
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
        logs.push('Created availability_cache table (if not exists).');

        // 3. 添加 tasks 表的缺失欄位
        try {
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_checked TIMESTAMP WITH TIME ZONE`;
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS check_count INTEGER DEFAULT 0`;
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS target_time VARCHAR(10)`;
            logs.push('Added missing columns to tasks table.');
        } catch (e) {
            logs.push('Tasks columns note: ' + e.message);
        }

        // 4. 創建索引
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users(line_user_id)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_availability_cache_lookup ON availability_cache(restaurant_id, date, time_slot)`;
            logs.push('Created indexes.');
        } catch (e) {
            logs.push('Index creation note: ' + e.message);
        }

        // 5. 驗證表是否創建成功
        const { rows: userCount } = await sql`SELECT COUNT(*) as count FROM users`;
        const { rows: cacheCount } = await sql`SELECT COUNT(*) as count FROM availability_cache`;
        logs.push(`Users table ready. Row count: ${userCount[0].count}`);
        logs.push(`Availability cache ready. Row count: ${cacheCount[0].count}`);

        return res.status(200).json({
            success: true,
            message: 'Database migration complete',
            logs
        });
    } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({
            error: String(error),
            stack: error.stack
        });
    }
};
