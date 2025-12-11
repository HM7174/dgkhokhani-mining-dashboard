const bcrypt = require('bcrypt');
const db = require('../db/db');
const auditLogger = require('../utils/auditLogger');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await db('users')
            .select('id', 'username', 'role', 'created_at', 'last_login')
            .orderBy('created_at', 'desc');

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new user (admin only)
const createUser = async (req, res) => {
    const { username, password, role } = req.body;

    // Validation
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const validRoles = ['admin', 'site_manager', 'dispatch', 'account'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        // Check if username already exists
        const existingUser = await db('users').where({ username }).first();
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await db('users')
            .insert({
                username,
                password_hash,
                role,
                created_at: new Date()
            })
            .returning(['id', 'username', 'role', 'created_at']);

        // Audit log
        await auditLogger.log(req.user.id, 'create_user', 'users', newUser.id, {
            username: newUser.username,
            role: newUser.role
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user (admin only)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;

    // Validation
    if (!username && !role) {
        return res.status(400).json({ error: 'At least one field (username or role) is required' });
    }

    if (role) {
        const validRoles = ['admin', 'site_manager', 'dispatch', 'account'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
    }

    try {
        // Check if user exists
        const user = await db('users').where({ id }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if new username already exists (if changing username)
        if (username && username !== user.username) {
            const existingUser = await db('users').where({ username }).first();
            if (existingUser) {
                return res.status(409).json({ error: 'Username already exists' });
            }
        }

        // Update user
        const updateData = {};
        if (username) updateData.username = username;
        if (role) updateData.role = role;

        const [updatedUser] = await db('users')
            .where({ id })
            .update(updateData)
            .returning(['id', 'username', 'role', 'created_at', 'last_login']);

        // Audit log
        await auditLogger.log(req.user.id, 'update_user', 'users', id, updateData);

        res.json(updatedUser);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Prevent self-deletion
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        // Check if user exists
        const user = await db('users').where({ id }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        await db('users').where({ id }).del();

        // Audit log
        await auditLogger.log(req.user.id, 'delete_user', 'users', id, {
            username: user.username,
            role: user.role
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Change user password (admin only)
const changePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validation
    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user exists
        const user = await db('users').where({ id }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const password_hash = await bcrypt.hash(newPassword, 10);

        // Update password
        await db('users')
            .where({ id })
            .update({ password_hash });

        // Audit log
        await auditLogger.log(req.user.id, 'change_password', 'users', id, {
            username: user.username
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    changePassword
};
