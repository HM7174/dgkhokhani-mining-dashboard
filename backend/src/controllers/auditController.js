const db = require('../db/db');

const getAuditLogs = async (req, res) => {
    try {
        const logs = await db('audit_logs')
            .leftJoin('users', 'audit_logs.user_id', 'users.id')
            .select(
                'audit_logs.*',
                'users.username as actor_name',
                'users.role as actor_role'
            )
            .orderBy('audit_logs.timestamp', 'desc')
            .limit(100); // Limit to last 100 actions for performance

        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAuditLogs
};
