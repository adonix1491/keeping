const { sql } = require('@vercel/postgres');
const { Client: LineClient } = require('@line/bot-sdk');

// Task monitor cron job
// Runs every 15 minutes to check subscribed tasks and notify users

module.exports = async (req, res) => {
    // Verify cron secret
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        if (process.env.VERCEL) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const logs = [];
        const startTime = Date.now();
        logs.push(`Task monitor started at ${new Date().toISOString()}`);

        // 1. Get all pending tasks that haven't been notified
        const { rows: tasks } = await sql`
            SELECT 
                t.id,
                t.user_id,
                t.line_user_id,
                t.restaurant_id,
                t.target_date,
                t.target_time,
                t.party_size,
                t.check_count,
                r.name as restaurant_name,
                r.booking_url
            FROM tasks t
            JOIN restaurants r ON t.restaurant_id = r.id
            WHERE t.status = 'PENDING' 
              AND (t.notified = FALSE OR t.notified IS NULL)
              AND t.target_date >= CURRENT_DATE
        `;

        logs.push(`Found ${tasks.length} pending tasks to check`);

        if (tasks.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No pending tasks',
                logs
            });
        }

        // Initialize LINE client
        const lineClient = new LineClient({
            channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
        });

        let notifiedCount = 0;
        let availableCount = 0;

        // 2. Check each task against availability cache
        for (const task of tasks) {
            try {
                // Update check count
                await sql`
                    UPDATE tasks 
                    SET check_count = check_count + 1, last_checked = NOW()
                    WHERE id = ${task.id}
                `;

                // Check if specific time slot is specified
                let whereClause;
                if (task.target_time) {
                    // User subscribed to specific time slot
                    const { rows: slots } = await sql`
                        SELECT status, has_inline_waitlist
                        FROM availability_cache
                        WHERE restaurant_id = ${task.restaurant_id}
                          AND date = ${task.target_date}
                          AND time_slot = ${task.target_time}
                    `;

                    if (slots.length > 0 && slots[0].status === 'AVAILABLE') {
                        availableCount++;

                        // Send LINE notification
                        const userId = task.line_user_id || task.user_id;
                        if (userId) {
                            try {
                                await lineClient.pushMessage(userId, {
                                    type: 'text',
                                    text: `🎉 候位通知！\n\n${task.restaurant_name}\n📅 ${task.target_date}\n⏰ ${task.target_time}\n👥 ${task.party_size}位\n\n該時段已開放訂位！\n立即預訂：${task.booking_url}`
                                });

                                // Mark as notified
                                await sql`
                                    UPDATE tasks 
                                    SET notified = TRUE, status = 'FOUND'
                                    WHERE id = ${task.id}
                                `;

                                notifiedCount++;
                                logs.push(`Notified user for ${task.restaurant_name} at ${task.target_time}`);
                            } catch (lineError) {
                                logs.push(`LINE push failed for task ${task.id}: ${lineError.message}`);
                            }
                        }
                    }
                } else {
                    // User subscribed to any available slot on the date
                    const { rows: availableSlots } = await sql`
                        SELECT time_slot
                        FROM availability_cache
                        WHERE restaurant_id = ${task.restaurant_id}
                          AND date = ${task.target_date}
                          AND status = 'AVAILABLE'
                        ORDER BY time_slot ASC
                        LIMIT 5
                    `;

                    if (availableSlots.length > 0) {
                        availableCount++;

                        const slotsText = availableSlots.map(s => s.time_slot).join(', ');
                        const userId = task.line_user_id || task.user_id;

                        if (userId) {
                            try {
                                await lineClient.pushMessage(userId, {
                                    type: 'text',
                                    text: `🎉 候位通知！\n\n${task.restaurant_name}\n📅 ${task.target_date}\n👥 ${task.party_size}位\n\n以下時段已開放：\n${slotsText}\n\n立即預訂：${task.booking_url}`
                                });

                                await sql`
                                    UPDATE tasks 
                                    SET notified = TRUE, status = 'FOUND'
                                    WHERE id = ${task.id}
                                `;

                                notifiedCount++;
                                logs.push(`Notified user for ${task.restaurant_name} with ${availableSlots.length} slots`);
                            } catch (lineError) {
                                logs.push(`LINE push failed for task ${task.id}: ${lineError.message}`);
                            }
                        }
                    }
                }
            } catch (taskError) {
                logs.push(`Error processing task ${task.id}: ${taskError.message}`);
            }
        }

        const duration = Date.now() - startTime;
        logs.push(`Completed: ${notifiedCount} notifications sent, ${availableCount} available slots found in ${duration}ms`);

        return res.status(200).json({
            success: true,
            message: 'Task monitor completed',
            stats: {
                tasksChecked: tasks.length,
                availableFound: availableCount,
                notificationsSent: notifiedCount,
                durationMs: duration
            },
            logs
        });

    } catch (error) {
        console.error('Task monitor error:', error);
        return res.status(500).json({ error: String(error) });
    }
};
