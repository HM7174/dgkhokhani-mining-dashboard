import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Key } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'site_manager'
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, {
                    username: formData.username,
                    role: formData.role
                });
            } else {
                await api.post('/users', formData);
            }
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
            setFormData({ username: '', password: '', role: 'site_manager' });
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.error || 'Failed to save user');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            await api.put(`/users/${selectedUser.id}/password`, {
                newPassword: passwordData.newPassword
            });
            setIsPasswordModalOpen(false);
            setSelectedUser(null);
            setPasswordData({ newPassword: '', confirmPassword: '' });
            alert('Password changed successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            alert(error.response?.data?.error || 'Failed to change password');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            role: user.role
        });
        setIsModalOpen(true);
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setIsPasswordModalOpen(true);
    };

    const columns = [
        { header: 'Username', accessor: 'username' },
        {
            header: 'Role',
            accessor: 'role',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${row.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        row.role === 'site_manager' ? 'bg-blue-100 text-blue-800' :
                            row.role === 'dispatch' ? 'bg-green-100 text-green-800' :
                                'bg-slate-100 text-slate-800'
                    }`}>
                    {row.role.replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Created',
            accessor: 'created_at',
            render: (row) => new Date(row.created_at).toLocaleDateString()
        },
        {
            header: 'Last Login',
            accessor: 'last_login',
            render: (row) => row.last_login ? new Date(row.last_login).toLocaleString() : 'Never'
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (row) => (
                <div className="flex space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(row);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit User"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openPasswordModal(row);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Change Password"
                    >
                        <Key size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ username: '', password: '', role: 'site_manager' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>Add User</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <Table
                    columns={columns}
                    data={users}
                />
            )}

            {/* Add/Edit User Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                title={editingUser ? 'Edit User' : 'Add New User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="admin">Admin</option>
                            <option value="site_manager">Site Manager</option>
                            <option value="dispatch">Dispatch</option>
                            <option value="account">Account</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            {editingUser ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setSelectedUser(null);
                }}
                title={`Change Password - ${selectedUser?.username}`}
            >
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        >
                            Change Password
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UsersPage;
