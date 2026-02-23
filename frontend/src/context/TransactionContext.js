import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const { isAuthenticated, token } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch transactions based on filter parameters
    const fetchTransactions = async (params = {}) => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params
            };

            const res = await axios.get('http://localhost:5000/api/transactions', config);
            setTransactions(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Error fetching transactions');
        }
        setLoading(false);
    };

    // Add new transaction (supports multipart/form-data for file uploads)
    const addTransaction = async (data) => {
        try {
            const isFormData = data instanceof FormData;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' })
                }
            };

            const res = await axios.post('http://localhost:5000/api/transactions', data, config);
            const updated = [...transactions, res.data].sort((a, b) => new Date(a.date) - new Date(b.date));
            setTransactions(updated);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Error adding transaction' };
        }
    };

    // Update transaction
    const updateTransaction = async (id, data) => {
        try {
            const isFormData = data instanceof FormData;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' })
                }
            };

            const res = await axios.put(`http://localhost:5000/api/transactions/${id}`, data, config);
            const updated = transactions.map(t => t._id === id ? res.data : t).sort((a, b) => new Date(a.date) - new Date(b.date));
            setTransactions(updated);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Error updating transaction' };
        }
    };

    // Delete transaction
    const deleteTransaction = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/transactions/${id}`, config);
            setTransactions(transactions.filter(t => t._id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Error deleting transaction' };
        }
    };

    // Initial fetch when user becomes authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchTransactions();
        } else {
            setTransactions([]);
        }
        // eslint-disable-next-line
    }, [isAuthenticated, token]);

    return (
        <TransactionContext.Provider value={{
            transactions,
            loading,
            error,
            fetchTransactions,
            addTransaction,
            updateTransaction,
            deleteTransaction
        }}>
            {children}
        </TransactionContext.Provider>
    );
};
