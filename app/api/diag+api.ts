import * as line from '@line/bot-sdk';

export async function GET(request: Request) {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    const secret = process.env.LINE_CHANNEL_SECRET || '';

    let sdkStatus = 'OK';
    try {
        // Just try to instantiate, don't call anything
        const client = new line.Client({ channelAccessToken: 'test', channelSecret: 'test' });
    } catch (e) {
        sdkStatus = String(e);
    }

    return Response.json({
        env_check: {
            LINE_CHANNEL_ACCESS_TOKEN: token ? `${token.substring(0, 5)}...` : 'MISSING',
            LINE_CHANNEL_SECRET: secret ? `${secret.substring(0, 5)}...` : 'MISSING',
            NODE_ENV: process.env.NODE_ENV,
        },
        sdk_check: sdkStatus
    });
}
