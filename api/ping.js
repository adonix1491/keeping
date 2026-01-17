module.exports = (req, res) => {
    res.status(200).json({
        message: 'Pong!',
        env_token_exists: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
        time: new Date().toISOString()
    });
};
