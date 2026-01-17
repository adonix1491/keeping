import { sql } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as line from '@line/bot-sdk';

function parseInlineUrl(url: string) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

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
        // Check by branch_id
        let restaurantId;
        const checkRes = await sql`SELECT id FROM restaurants WHERE branch_id = ${bid}`;

        if (checkRes.rows.length > 0) {
            restaurantId = checkRes.rows[0].id;
        } else {
            // Insert new
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
        const lineClient = new line.Client(lineConfig);

        try {
            await lineClient.pushMessage(userId, {
                type: 'text',
                text: `✅ 預約監控已建立！\n\n日期時段：${targetDate}\n人數：${partySize} 位\n\n系統正在為您監控空位，一旦有釋出將會立即發送通知給您！🚀`,
            });
        } catch (err) {
            console.error('Failed to send LINE confirmation:', err);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error) });
    }
}
