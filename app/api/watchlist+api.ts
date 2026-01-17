import { sql } from '@vercel/postgres';
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

export async function POST(request: Request) {
    try {
        const { userId, bookingUrl, targetDate, partySize } = await request.json();

        if (!userId || !bookingUrl) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const parsed = parseInlineUrl(bookingUrl);
        if (!parsed) {
            return Response.json({ error: 'Invalid Booking URL' }, { status: 400 });
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
        const lineClient = new line.Client(lineConfig);

        try {
            await lineClient.pushMessage(userId, {
                type: 'text',
                text: `✅ 預約監控已建立！\n\n日期時段：${targetDate}\n人數：${partySize} 位\n\n系統正在為您監控空位，一旦有釋出將會立即發送通知給您！🚀`,
            });
        } catch (err) {
            console.error('Failed to send LINE confirmation:', err);
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error(error);
        return Response.json({ error: String(error) }, { status: 500 });
    }
}
