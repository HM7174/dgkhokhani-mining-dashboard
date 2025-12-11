import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';

const AuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/audit');
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { header: 'Timestamp', accessor: 'timestamp', render: (row) => new Date(row.timestamp).toLocaleString() },
        { header: 'Actor', accessor: 'actor_name' },
        { header: 'Role', accessor: 'actor_role' },
        { header: 'Action', accessor: 'action' },
        { header: 'Details', accessor: 'details', render: (row) => JSON.stringify(row.details) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <Table columns={columns} data={logs} />
            )}
        </div>
    );
};

export default AuditLogsPage;
