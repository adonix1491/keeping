import { VercelRequest, VercelResponse } from '@vercel/node';
import * as line from '@line/bot-sdk';

export default function handler(req: VercelRequest, res: VercelResponse) {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    const secret = process.env.LINE_CHANNEL_SECRET || '';

    let sdkStatus = 'OK';
    try {
        // Just try to instantiate, don't call anything
        const client = new line.Client({ channelAccessToken: 'test', channelSecret: 'test' });
    } catch (e) {
        sdkStatus = String(e);
    }

    res.status(200).json({
        env_check: {
            LINE_CHANNEL_ACCESS_TOKEN: token ? `${token.substring(0, 5)}...` : 'MISSING',
            LINE_CHANNEL_SECRET: secret ? `${secret.substring(0, 5)}...` : 'MISSING',
            NODE_ENV: process.env.NODE_ENV,
        },
        sdk_check: sdkStatus,
        location: 'api/diag.ts (Native)'
    });
}
