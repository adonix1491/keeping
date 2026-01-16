export default function handler(request, response) {
    response.status(200).json({
        message: 'Hello from Vercel Node.js!',
        time: new Date().toISOString(),
    });
}
