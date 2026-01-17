const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new line.Client(config);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const events = req.body.events;
        const results = await Promise.all(
            events.map(async (event) => {
                return handleEvent(event);
            })
        );
        res.status(200).json({ results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', details: String(err) });
    }
};

async function handleEvent(event) {
    if (event.type === 'follow') {
        const userId = event.source.userId;
        console.log(`[NEW FOLLOWER] User ID: ${userId}`);
        return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `歡迎使用候位通！\n您的 User ID 是：\n${userId}\n\n請在 App 設定中輸入此 ID 以啟用通知功能。`,
        });
    }

    if (event.type === 'message' && event.message.type === 'text') {
        const text = event.message.text.toUpperCase().trim();
        if (text === 'ID' || text === 'USERID') {
            const userId = event.source.userId;
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: `您的 User ID:\n${userId}`,
            });
        }
    }
    return Promise.resolve(null);
}
