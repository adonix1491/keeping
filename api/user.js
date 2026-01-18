const { sql } = require('@vercel/postgres');

/**
 * 用戶管理 API
 * 
 * GET /api/user?deviceId=xxx - 查詢用戶資料與點數
 * POST /api/user - 創建/更新用戶資料
 *   body: { deviceId, lineUserId?, email?, action: 'bind_line' | 'bind_email' | 'update' }
 */
module.exports = async (req, res) => {
    // 處理 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            return await handleGetUser(req, res);
        } else if (req.method === 'POST') {
            return await handleUpdateUser(req, res);
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('User API Error:', error);
        return res.status(500).json({ error: String(error) });
    }
};

/**
 * 查詢用戶資料
 * @param {Object} req - HTTP 請求
 * @param {Object} res - HTTP 回應
 */
async function handleGetUser(req, res) {
    const { deviceId } = req.query;

    if (!deviceId) {
        return res.status(400).json({ error: 'deviceId is required' });
    }

    // 查詢或創建用戶
    let { rows } = await sql`
        SELECT id, device_id, line_user_id, email, points, 
               line_bound_at, email_bound_at, created_at
        FROM users WHERE device_id = ${deviceId}
    `;

    if (rows.length === 0) {
        // 新用戶，自動創建
        const { rows: newRows } = await sql`
            INSERT INTO users (device_id, points)
            VALUES (${deviceId}, 0)
            RETURNING id, device_id, line_user_id, email, points, 
                      line_bound_at, email_bound_at, created_at
        `;
        rows = newRows;
    }

    const user = rows[0];
    return res.status(200).json({
        success: true,
        user: {
            deviceId: user.device_id,
            lineUserId: user.line_user_id,
            email: user.email,
            points: user.points,
            isLineBound: !!user.line_bound_at,
            isEmailBound: !!user.email_bound_at,
            lineBoundAt: user.line_bound_at,
            emailBoundAt: user.email_bound_at
        }
    });
}

/**
 * 更新用戶資料（綁定 LINE ID 或 Email）
 * @param {Object} req - HTTP 請求
 * @param {Object} res - HTTP 回應
 */
async function handleUpdateUser(req, res) {
    const { deviceId, lineUserId, email, action } = req.body;

    if (!deviceId) {
        return res.status(400).json({ error: 'deviceId is required' });
    }

    // 確保用戶存在
    let { rows: existingUser } = await sql`
        SELECT id, line_user_id, email, points, line_bound_at, email_bound_at
        FROM users WHERE device_id = ${deviceId}
    `;

    if (existingUser.length === 0) {
        // 創建新用戶
        const { rows: newRows } = await sql`
            INSERT INTO users (device_id, points)
            VALUES (${deviceId}, 0)
            RETURNING id, line_user_id, email, points, line_bound_at, email_bound_at
        `;
        existingUser = newRows;
    }

    const user = existingUser[0];
    let pointsAwarded = 0;
    let message = '';

    if (action === 'bind_line' && lineUserId) {
        // 綁定 LINE ID
        const isFirstBind = !user.line_bound_at;

        // 檢查 LINE ID 是否已被其他用戶綁定
        const { rows: conflict } = await sql`
            SELECT id FROM users 
            WHERE line_user_id = ${lineUserId} AND device_id != ${deviceId}
        `;

        if (conflict.length > 0) {
            return res.status(400).json({
                error: '此 LINE ID 已被其他帳號綁定',
                code: 'LINE_ID_CONFLICT'
            });
        }

        if (isFirstBind) {
            // 首次綁定，給予 30 點
            await sql`
                UPDATE users 
                SET line_user_id = ${lineUserId}, 
                    line_bound_at = NOW(),
                    points = points + 30
                WHERE device_id = ${deviceId}
            `;
            pointsAwarded = 30;
            message = 'LINE ID 綁定成功，獲得 30 點！';
        } else {
            // 變更綁定，不給點數
            await sql`
                UPDATE users 
                SET line_user_id = ${lineUserId}
                WHERE device_id = ${deviceId}
            `;
            message = 'LINE ID 變更成功';
        }
    } else if (action === 'bind_email' && email) {
        // 綁定 Email
        const isFirstBind = !user.email_bound_at;

        // 檢查 Email 是否已被其他用戶綁定
        const { rows: conflict } = await sql`
            SELECT id FROM users 
            WHERE email = ${email} AND device_id != ${deviceId}
        `;

        if (conflict.length > 0) {
            return res.status(400).json({
                error: '此 Email 已被其他帳號綁定',
                code: 'EMAIL_CONFLICT'
            });
        }

        if (isFirstBind) {
            // 首次綁定，給予 30 點
            await sql`
                UPDATE users 
                SET email = ${email}, 
                    email_bound_at = NOW(),
                    points = points + 30
                WHERE device_id = ${deviceId}
            `;
            pointsAwarded = 30;
            message = 'Email 綁定成功，獲得 30 點！';
        } else {
            // 變更綁定，不給點數
            await sql`
                UPDATE users 
                SET email = ${email}
                WHERE device_id = ${deviceId}
            `;
            message = 'Email 變更成功';
        }
    } else {
        return res.status(400).json({ error: 'Invalid action or missing data' });
    }

    // 取得更新後的用戶資料
    const { rows: updatedRows } = await sql`
        SELECT device_id, line_user_id, email, points, 
               line_bound_at, email_bound_at
        FROM users WHERE device_id = ${deviceId}
    `;

    const updated = updatedRows[0];
    return res.status(200).json({
        success: true,
        message,
        pointsAwarded,
        user: {
            deviceId: updated.device_id,
            lineUserId: updated.line_user_id,
            email: updated.email,
            points: updated.points,
            isLineBound: !!updated.line_bound_at,
            isEmailBound: !!updated.email_bound_at
        }
    });
}
