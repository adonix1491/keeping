import { sql } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';
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

        // This logic mimics the Python one: finding window.__INITIAL_STATE__
        const prefix = 'window.__INITIAL_STATE__ = ';
        const jsonStart = html.indexOf(prefix);
        if (jsonStart !== -1) {
            // Simple string extraction to check for "available"
            // In a real robust implementation we might parse JSON, but here we can just check existence
            // Logic: If we see available times for the target date, return true
            // For simplify: just return true for test if date is found in response
            return html.includes(targetDate);
        }
    } catch (e) {
        console.error("Check Error:", e);
    }
    return false; // Assume false if error
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("🚀 Cron Job Triggered (Node.js)");

    try {
        // 1. Fetch PENDING tasks
        const { rows: tasks } = await sql`
            SELECT t.id, t.user_id, t.target_date, t.party_size, r.company_id, r.branch_id, r.booking_url 
            FROM tasks t 
            JOIN restaurants r ON t.restaurant_id = r.id 
            WHERE t.status='PENDING'
        `;

        const results = [];

        for (const task of tasks) {
            // 2. Check Availability
            // In a real crawler, we would call the inline API APIs or parse the page
            // Here we use a placeholder check logic or the previous mock logic

            // NOTE: Since the previous Python code was using requests to fetch page content, 
            // we will simulate the check here.

            const isAvailable = await checkAvailability(task.booking_url, task.target_date, task.party_size);

            if (isAvailable) {
                // 3. Send Notification
                try {
                    await client.pushMessage(task.user_id, {
                        type: 'text',
                        text: `🔥 發現空位！\n餐廳：${task.url}\n日期：${task.target_date}\n人數：${task.party_size}人\n請盡快訂位！`
                    });

                    // 4. Update Status
                    await sql`UPDATE tasks SET status='NOTIFIED' WHERE id=${task.id}`;
                    results.push(`Notified user ${task.user_id}`);
                } catch (lineError) {
                    console.error("LINE Error:", lineError);
                }
            } else {
                results.push(`Task ${task.id}: No availability`);
            }
        }

        res.status(200).json({ success: true, results });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error) });
    }
}
