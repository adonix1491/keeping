const { sql } = require('@vercel/postgres');

/**
 * 資料庫遷移 - 新增 users 資料表
 * 此腳本只新增表，不會刪除或重置現有資料
 */
module.exports = async (req, res) => {
    try {
        const logs = [];
        logs.push('Starting users table migration...');

        // 創建 users 資料表（如果不存在）
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

        // 創建索引
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users(line_user_id)`;
            logs.push('Created indexes on users table.');
        } catch (e) {
            logs.push('Index creation note: ' + e.message);
        }

        // 檢查表是否創建成功
        const { rows } = await sql`
            SELECT COUNT(*) as count FROM users
        `;
        logs.push(`Users table ready. Current row count: ${rows[0].count}`);

        return res.status(200).json({
            success: true,
            message: 'Users table migration complete',
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
