const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    try {
        let logs = [];

        // 1. Check if column exists info
        try {
            // Just try to select it. If fails, it doesn't exist.
            // Or query information_schema.
            const info = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='tasks' AND column_name='line_user_id';
             `;
            if (info.rows.length > 0) {
                logs.push('Column line_user_id ALREADY EXISTS.');
            } else {
                logs.push('Column line_user_id MISSING. Attempting to add...');
                await sql`ALTER TABLE tasks ADD COLUMN line_user_id VARCHAR(255);`;
                logs.push('Successfully executed ALTER TABLE.');
            }
        } catch (e) {
            logs.push(`ALTER TABLE FAILED: ${String(e)}`);
        }

        return res.status(200).json({
            message: 'Setup Check Complete',
            logs: logs
        });
    } catch (error) {
        return res.status(500).json({ error: String(error) });
    }
};
