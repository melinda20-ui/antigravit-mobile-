

/**
 * Sends a message via Telegram bot if configured in environment variables.
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} True if successful or disabled, false if errored
 */
export async function sendTelegramNotification(message) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Fast exit if not configured
    if (!botToken || !chatId) {
        return true; 
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (!response.ok) {
            console.error('[Telegram] Failed to send notification:', response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Telegram] Error sending notification:', error.message);
        return false;
    }
}
