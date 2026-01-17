const line = require('@line/bot-sdk');

module.exports = (req, res) => {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    const secret = process.env.LINE_CHANNEL_SECRET || '';

    let sdkStatus = 'OK';
    try {
        const client = new line.Client({ channelAccessToken: 'test', channelSecret: 'test' });
    } catch (e) {
        sdkStatus = String(e);
    }

    res.status(200).json({
        env_check: {
            LINE_CHANNEL_ACCESS_TOKEN: token ? `${token.substring(0, 5)}...` : 'MISSING',
            LINE_CHANNEL_SECRET: secret ? `${secret.substring(0, 5)}...` : 'MISSING'
        },
        sdk_check: sdkStatus,
        location: 'api/diag.js (Pure JS)'
    });
};
