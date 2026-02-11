import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Transaction {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalTransactions: number;
  totalTransactionVolume: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('tcw1_token');

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin || isAdmin !== 'true') {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [activeTab, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (activeTab === 'overview') {
        const response = await fetch('/api/admin/stats', { headers });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Failed to load dashboard stats');
        }
      } else if (activeTab === 'users') {
        const response = await fetch('/api/admin/users', { headers });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError('Failed to load users');
        }
      } else if (activeTab === 'transactions') {
        const response = await fetch('/api/admin/transactions', { headers });
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          setError('Failed to load transactions');
        }
      }
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/make-admin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh users list
        fetchDashboardData();
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      setError('Error updating user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchDashboardData();
        } else {
          setError('Failed to delete user');
        }
      } catch (err) {
        setError('Error deleting user');
        console.error(err);
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => {
          localStorage.removeItem('tcw1_token');
          localStorage.removeItem('tcw1_user');
          localStorage.removeItem('isAdmin');
          navigate('/');
        }} className="logout-btn">Logout</button>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                  <h3>Admin Users</h3>
                  <p className="stat-value">{stats.totalAdmins}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Transactions</h3>
                  <p className="stat-value">{stats.totalTransactions}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Volume</h3>
                  <p className="stat-value">${stats.totalTransactionVolume.toFixed(2)}</p>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-table">
                <h2>User Management</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Admin</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.email}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>
                          <span className={`badge ${user.isAdmin ? 'admin' : 'user'}`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="actions">
                          {!user.isAdmin && (
                            <button
                              onClick={() => handleMakeAdmin(user._id)}
                              className="btn-small btn-promote"
                            >
                              Make Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="btn-small btn-delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="transactions-table">
                <h2>Transaction History</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(txn => (
                      <tr key={txn._id}>
                        <td>{txn.type}</td>
                        <td>${txn.amount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${txn.status.toLowerCase()}`}>
                            {txn.status}
                          </span>
                        </td>
                        <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
