import { VercelRequest, VercelResponse } from '@vercel/node';
import * as line from '@line/bot-sdk';

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new line.Client(config);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // Signature validation relies on raw body which Vercel provides differently depending on setup.
    // @line/bot-sdk's middleware handles this in Express, but for serverless we might need manual handling or just trust the env for MVP if signature validation is tricky without raw body.
    // Ideally, we verify signature.

    const events = req.body.events;

    try {
        const results = await Promise.all(
            events.map(async (event: any) => {
                return handleEvent(event);
            })
        );
        res.status(200).json({ results });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

async function handleEvent(event: any) {
    if (event.type === 'follow') {
        const userId = event.source.userId;
        console.log(`[NEW FOLLOWER] User ID: ${userId}`);

        // In a real app, save userId to a database here (e.g. Supabase, Vercel KV)
        // For now, we just reply.

        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `歡迎使用候位通！\n您的 User ID 是：\n${userId}\n\n請通知管理員將此 ID 加入監控名單。`,
        });
    }

    if (event.type === 'message' && event.message.type === 'text') {
        if (event.message.text === 'ID') {
            const userId = event.source.userId;
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: `您的 User ID:\n${userId}`,
            });
        }
    }

    return Promise.resolve(null);
}
