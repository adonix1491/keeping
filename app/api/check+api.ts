import { sql } from '@vercel/postgres';
import * as line from '@line/bot-sdk';

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new line.Client(config);

async function checkAvailability(url: string, targetDate: string, partySize: number) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const prefix = 'window.__INITIAL_STATE__ = ';
        const jsonStart = html.indexOf(prefix);
        if (jsonStart !== -1) {
            return html.includes(targetDate);
        }
    } catch (e) {
        console.error("Check Error:", e);
    }
    return false;
}

export async function GET(request: Request) {
    console.log("🚀 Cron Job Triggered (Expo Router API)");

    try {
        const { rows: tasks } = await sql`
            SELECT t.id, t.user_id, t.target_date, t.party_size, r.company_id, r.branch_id, r.booking_url 
            FROM tasks t 
            JOIN restaurants r ON t.restaurant_id = r.id 
            WHERE t.status='PENDING'
        `;

        const results = [];

        for (const task of tasks) {
            const isAvailable = await checkAvailability(task.booking_url, task.target_date, task.party_size);

            if (isAvailable) {
                try {
                    await client.pushMessage(task.user_id, {
                        type: 'text',
                        text: `🔥 發現空位！\n餐廳：${task.url}\n日期：${task.target_date}\n人數：${task.party_size}人\n請盡快訂位！`
                    });

                    await sql`UPDATE tasks SET status='NOTIFIED' WHERE id=${task.id}`;
                    results.push(`Notified user ${task.user_id}`);
                } catch (lineError) {
                    console.error("LINE Error:", lineError);
                }
            } else {
                results.push(`Task ${task.id}: No availability`);
            }
        }

        return Response.json({ success: true, results });

    } catch (error) {
        console.error(error);
        return Response.json({ error: String(error) }, { status: 500 });
    }
}
