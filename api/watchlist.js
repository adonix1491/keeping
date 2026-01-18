const { sql } = require('@vercel/postgres');
const line = require('@line/bot-sdk');

// Helper to parse body safely
const parseBody = (req) => {
    if (!req.body) return {};
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch (e) { return {}; }
    }
    return req.body;
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const method = req.method ? req.method.toUpperCase() : 'GET';

        // GET Handler
        if (method === 'GET') {
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: 'Missing userId' });
            }
            // Use line_user_id check
            const tasks = await sql`
                SELECT t.*, r.name as restaurant_name, r.booking_url 
                FROM tasks t
                JOIN restaurants r ON t.restaurant_id = r.id
                WHERE t.line_user_id = ${userId} OR t.user_id = ${userId}
                ORDER BY t.created_at DESC
            `;
            return res.status(200).json(tasks.rows);
        }

        // POST Handler (Add to Watchlist)
        if (method === 'POST') {
            const body = parseBody(req);
            const { userId, restaurantId, targetDate, partySize, targetTime, deviceId } = body;

            if (!userId || !restaurantId || !targetDate || !partySize) {
                return res.status(400).json({
                    error: 'Missing fields',
                    received: body
                });
            }

            // 1. 檢查用戶點數是否足夠（訂閱監控消耗 1 點）
            const userDeviceId = deviceId || userId;
            const { rows: userRows } = await sql`
                SELECT points FROM users WHERE device_id = ${userDeviceId} OR line_user_id = ${userId}
            `;

            if (userRows.length === 0) {
                return res.status(400).json({
                    error: '請先至設定頁完成綁定',
                    code: 'USER_NOT_FOUND'
                });
            }

            if (userRows[0].points < 1) {
                return res.status(400).json({
                    error: '點數不足，無法新增監控任務（需要 1 點）',
                    code: 'INSUFFICIENT_POINTS',
                    currentPoints: userRows[0].points
                });
            }

            // 2. Get Restaurant Info for push message
            const { rows: restaurants } = await sql`SELECT * FROM restaurants WHERE id = ${restaurantId}`;
            if (restaurants.length === 0) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }
            const restaurant = restaurants[0];

            // 3. 扣除點數（訂閱監控消耗 1 點）
            await sql`
                UPDATE users SET points = points - 1 
                WHERE device_id = ${userDeviceId} OR line_user_id = ${userId}
            `;

            // 4. Insert Task (Use both ID columns for robust matching)
            await sql`
                INSERT INTO tasks (user_id, line_user_id, restaurant_id, target_date, target_time, party_size, status) 
                VALUES (${userId}, ${userId}, ${restaurantId}, ${targetDate}, ${targetTime || null}, ${partySize}, 'PENDING')
            `;

            // 3. Send LINE Confirmation (Async, don't block response if fails)
            try {
                const lineConfig = {
                    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
                    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
                };
                if (lineConfig.channelAccessToken) {
                    const lineClient = new line.Client(lineConfig);
                    const pushMsg = {
                        type: 'text',
                        text: `✅ 預約監控已建立！\n\n餐廳：${restaurant.name}\n日期：${targetDate}\n人數：${partySize}人\n\n一旦有空位，我會馬上通知您！`
                    };
                    await lineClient.pushMessage(userId, pushMsg);
                }
            } catch (lineError) {
                console.error('LINE Push Failed:', lineError);
                // Swallow error so user still gets Success
            }

            return res.status(200).json({ success: true, message: 'Task added' });
        }

        return res.status(405).json({ error: `Method ${method} Not Allowed` });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: String(error), stack: error.stack });
    }
};
