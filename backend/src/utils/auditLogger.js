const db = require('../db/db');

const logAction = async (userId, action, details = {}) => {
    try {
        await db('audit_logs').insert({
            user_id: userId,
            action,
            details: JSON.stringify(details)
        });
    } catch (error) {
        console.error('Failed to log audit action:', error);
        // Don't throw error to avoid blocking main flow
    }
};

module.exports = { logAction };
