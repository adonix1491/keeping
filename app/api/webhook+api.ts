import * as line from '@line/bot-sdk';

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new line.Client(config);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const events = body.events;

        const results = await Promise.all(
            events.map(async (event: any) => {
                return handleEvent(event);
            })
        );
        return Response.json({ results });
    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function handleEvent(event: any) {
    if (event.type === 'follow') {
        const userId = event.source.userId;
        console.log(`[NEW FOLLOWER] User ID: ${userId}`);

        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `歡迎使用候位通！\n您的 User ID 是：\n${userId}\n\n請在 App 設定中輸入此 ID 以啟用通知功能。`,
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
