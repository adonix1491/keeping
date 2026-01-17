const { sql } = require('@vercel/postgres');
const line = require('@line/bot-sdk');

function parseInlineUrl(url) {
    try {
        const parts = url.split('/booking/');
        if (parts.length > 1) {
            const ids = parts[1].split('/');
            if (ids.length >= 2) {
                const cid = ids[0];
                const bid = ids[1].split('?')[0];
                return { cid, bid };
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

module.exports = async (req, res) => {
    const method = req.method ? req.method.toUpperCase() : 'UNKNOWN';

    // GET: List Tasks
    if (method === 'GET') {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        try {
            const { rows } = await sql`
            SELECT 
                t.id, 
                t.restaurant_id, 
                r.name as restaurant_name, 
                t.target_date, 
                t.party_size, 
                t.status
            FROM tasks t
            JOIN restaurants r ON t.restaurant_id = r.id
            WHERE t.user_id = ${userId} OR t.line_user_id = ${userId}
            ORDER BY t.created_at DESC
            `;

            const items = rows.map(row => ({
                id: row.id.toString(),
                restaurantId: row.restaurant_id.toString(),
                restaurantName: row.restaurant_name,
                targetDate: row.target_date,
                partySize: row.party_size,
                status: row.status === 'NOTIFIED' ? 'FOUND' : 'LOADING',
                foundSlot: row.status === 'NOTIFIED' ? 'Check LINE' : undefined
            }));

            return res.status(200).json(items);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: String(error) });
        }
    }

    // POST: Add Task
    if (method === 'POST') {
        try {
            const { userId, bookingUrl, targetDate, partySize } = req.body;

            if (!userId || !bookingUrl) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const parsed = parseInlineUrl(bookingUrl);
            if (!parsed) {
                return res.status(400).json({ error: 'Invalid Booking URL' });
            }
            const { cid, bid } = parsed;

            // 1. Ensure Restaurant Exists
            let restaurantId;
            const checkRes = await sql`SELECT id FROM restaurants WHERE branch_id = ${bid}`;

            if (checkRes.rows.length > 0) {
                restaurantId = checkRes.rows[0].id;
            } else {
                const insertRes = await sql`
                    INSERT INTO restaurants (company_id, branch_id, name, booking_url) 
                    VALUES (${cid}, ${bid}, 'Unknown', ${bookingUrl})
                    RETURNING id;
                `;
                restaurantId = insertRes.rows[0].id;
            }

            // 2. Insert Task
            await sql`
                INSERT INTO tasks (user_id, restaurant_id, target_date, party_size, status) 
                VALUES (${userId}, ${restaurantId}, ${targetDate}, ${partySize}, 'PENDING');
            `;

            // 3. Send LINE Confirmation
            const lineConfig = {
                channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
                channelSecret: process.env.LINE_CHANNEL_SECRET || '',
            };

            try {
                const lineClient = new line.Client(lineConfig);
                await lineClient.pushMessage(userId, {
                    type: 'text',
                    text: `✅ 預約監控已建立！\n\n日期時段：${targetDate}\n人數：${partySize} 位\n\n系統正在為您監控空位，一旦有釋出將會立即發送通知給您！🚀`,
                });
            } catch (err) {
                console.error('Failed to send LINE confirmation:', err);
                // Don't fail the request if LINE fails, just log it
            }

            return res.status(200).json({ success: true });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: String(error) });
        }
    }

    // Debug: Return method received
    return res.status(405).json({
        error: 'Method Not Allowed',
        received_method: method,
        debug_tip: 'Check if you are sending the right method'
    });
};
