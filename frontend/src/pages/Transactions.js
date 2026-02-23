import React, { useState, useContext, useEffect, useMemo } from 'react';
import { TransactionContext } from '../context/TransactionContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faCheck, faTimes, faEye, faPen, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './Transactions.css';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Transactions = () => {
    const { transactions, loading, fetchTransactions, deleteTransaction, addTransaction, updateTransaction } = useContext(TransactionContext);

    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

    // Inline Add
    const [isAddingRow, setIsAddingRow] = useState(false);
    const getDefaultDay = () => {
        const today = new Date();
        if (today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth) return today.getDate();
        return 1;
    };
    const emptyRow = { day: getDefaultDay(), generalOffering: '', specialOffering: '', specialOfferingNames: '', tithe: '', titheNames: '', expenses: '', expenseDetails: '', remarks: '' };
    const [newTx, setNewTx] = useState({ ...emptyRow });
    const [proofFile, setProofFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inline Edit
    const [editingId, setEditingId] = useState(null);
    const [editTx, setEditTx] = useState({});
    const [editProofFile, setEditProofFile] = useState(null);

    useEffect(() => {
        fetchTransactions({ year: selectedYear, month: selectedMonth });
        setIsAddingRow(false);
        setEditingId(null);
        // eslint-disable-next-line
    }, [selectedYear, selectedMonth]);

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    // Totals
    const totals = useMemo(() => {
        return transactions.reduce((acc, tx) => {
            acc.generalOffering += tx.generalOffering || 0;
            acc.specialOffering += tx.specialOffering || 0;
            acc.tithe += tx.tithe || 0;
            acc.expenses += tx.expenses || 0;
            return acc;
        }, { generalOffering: 0, specialOffering: 0, tithe: 0, expenses: 0 });
    }, [transactions]);
    const totalOfferings = totals.generalOffering + totals.specialOffering + totals.tithe;
    const balance = totalOfferings - totals.expenses;

    // --- Add Row Handlers ---
    const handleNewTxChange = (e) => setNewTx({ ...newTx, [e.target.name]: e.target.value });

    const handleSaveRow = async () => {
        setIsSubmitting(true);
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(newTx.day).padStart(2, '0')}`;
        const formData = new FormData();
        formData.append('date', dateStr);
        formData.append('generalOffering', newTx.generalOffering || 0);
        formData.append('specialOffering', newTx.specialOffering || 0);
        formData.append('specialOfferingNames', newTx.specialOfferingNames);
        formData.append('tithe', newTx.tithe || 0);
        formData.append('titheNames', newTx.titheNames);
        formData.append('expenses', newTx.expenses || 0);
        formData.append('expenseDetails', newTx.expenseDetails);
        formData.append('remarks', newTx.remarks);
        if (proofFile) formData.append('proof', proofFile);

        const res = await addTransaction(formData);
        setIsSubmitting(false);
        if (res.success) {
            setIsAddingRow(false);
            setNewTx({ ...emptyRow });
            setProofFile(null);
        } else {
            alert(res.msg || 'Error');
        }
    };

    const handleCancelRow = () => { setIsAddingRow(false); setNewTx({ ...emptyRow }); setProofFile(null); };

    // --- Edit Row Handlers ---
    const startEdit = (tx) => {
        setEditingId(tx._id);
        setEditTx({
            day: new Date(tx.date).getDate(),
            generalOffering: tx.generalOffering || '',
            specialOffering: tx.specialOffering || '',
            specialOfferingNames: tx.specialOfferingNames || '',
            tithe: tx.tithe || '',
            titheNames: tx.titheNames || '',
            expenses: tx.expenses || '',
            expenseDetails: tx.expenseDetails || '',
            remarks: tx.remarks || ''
        });
        setEditProofFile(null);
    };

    const handleEditChange = (e) => setEditTx({ ...editTx, [e.target.name]: e.target.value });

    const handleSaveEdit = async () => {
        setIsSubmitting(true);
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(editTx.day).padStart(2, '0')}`;
        const formData = new FormData();
        formData.append('date', dateStr);
        formData.append('generalOffering', editTx.generalOffering || 0);
        formData.append('specialOffering', editTx.specialOffering || 0);
        formData.append('specialOfferingNames', editTx.specialOfferingNames);
        formData.append('tithe', editTx.tithe || 0);
        formData.append('titheNames', editTx.titheNames);
        formData.append('expenses', editTx.expenses || 0);
        formData.append('expenseDetails', editTx.expenseDetails);
        formData.append('remarks', editTx.remarks);
        if (editProofFile) formData.append('proof', editProofFile);

        const res = await updateTransaction(editingId, formData);
        setIsSubmitting(false);
        if (res.success) {
            setEditingId(null);
            setEditTx({});
            setEditProofFile(null);
        } else {
            alert(res.msg || 'Error updating');
        }
    };

    const handleCancelEdit = () => { setEditingId(null); setEditTx({}); setEditProofFile(null); };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this record?')) await deleteTransaction(id);
    };

    // Month nav
    const prevMonth = () => { if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); } else setSelectedMonth(selectedMonth - 1); };
    const nextMonth = () => { if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); } else setSelectedMonth(selectedMonth + 1); };

    // Inline input helper
    const inlineInput = (name, val, onChange, type = 'text', placeholder = '') => (
        <input type={type} name={name} value={val} onChange={onChange} placeholder={placeholder} className="form-input inline-input" />
    );

    // Day selector helper
    const daySelector = (val, onChange) => (
        <select name="day" value={val} onChange={onChange} className="form-input inline-input" style={{ width: '60px' }}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
    );

    return (
        <div className="transactions-page animate-fade-in">
            {/* Year + Month Navigation */}
            <div className="sheet-nav">
                <div className="year-selector">
                    <button className="nav-arrow" onClick={() => setSelectedYear(selectedYear - 1)}><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <span className="year-label">{selectedYear}</span>
                    <button className="nav-arrow" onClick={() => setSelectedYear(selectedYear + 1)}><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
                <div className="month-tabs">
                    {MONTH_NAMES.map((m, i) => (
                        <button key={m} className={`month-tab ${selectedMonth === i + 1 ? 'active' : ''}`} onClick={() => setSelectedMonth(i + 1)}>
                            {m.substring(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="page-header d-flex justify-between align-center">
                <div>
                    <h1>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</h1>
                    <p className="text-muted">Church finance records for this month.</p>
                </div>
                <button onClick={() => { setIsAddingRow(true); setEditingId(null); }} className="btn-primary export-btn" disabled={isAddingRow}>
                    <FontAwesomeIcon icon={faPlus} /> Add Row
                </button>
            </div>

            {/* Table */}
            <div className="card table-card">
                <div className="table-responsive">
                    <table className="fms-table church-table">
                        <thead>
                            <tr>
                                <th rowSpan="2">Date</th>
                                <th rowSpan="2">Gen. Offering</th>
                                <th colSpan="2" className="th-group">Special Offerings</th>
                                <th colSpan="2" className="th-group">Tithe</th>
                                <th colSpan="2" className="th-group">Expenditure</th>
                                <th rowSpan="2">Remarks</th>
                                <th rowSpan="2">Proof</th>
                                <th rowSpan="2">Actions</th>
                            </tr>
                            <tr>
                                <th>Amount</th><th>Names</th>
                                <th>Amount</th><th>Names</th>
                                <th>Amount</th><th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="11" className="text-center">Loading...</td></tr>
                            ) : transactions.length === 0 && !isAddingRow ? (
                                <tr><td colSpan="11" className="text-center text-muted">No records for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    editingId === tx._id ? (
                                        /* EDIT MODE ROW */
                                        <tr key={tx._id} className="add-row-highlight">
                                            <td>{daySelector(editTx.day, handleEditChange)}</td>
                                            <td>{inlineInput('generalOffering', editTx.generalOffering, handleEditChange, 'number', '0')}</td>
                                            <td>{inlineInput('specialOffering', editTx.specialOffering, handleEditChange, 'number', '0')}</td>
                                            <td>{inlineInput('specialOfferingNames', editTx.specialOfferingNames, handleEditChange, 'text', 'Names...')}</td>
                                            <td>{inlineInput('tithe', editTx.tithe, handleEditChange, 'number', '0')}</td>
                                            <td>{inlineInput('titheNames', editTx.titheNames, handleEditChange, 'text', 'Names...')}</td>
                                            <td>{inlineInput('expenses', editTx.expenses, handleEditChange, 'number', '0')}</td>
                                            <td>{inlineInput('expenseDetails', editTx.expenseDetails, handleEditChange, 'text', 'Details...')}</td>
                                            <td>{inlineInput('remarks', editTx.remarks, handleEditChange, 'text', 'Remarks...')}</td>
                                            <td>
                                                <input type="file" accept="image/*,.pdf" onChange={(e) => setEditProofFile(e.target.files[0])} className="inline-file-input" />
                                                {tx.proofUrl && !editProofFile && <span className="text-muted" style={{ fontSize: '0.7rem' }}>Current proof exists</span>}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={handleSaveEdit} disabled={isSubmitting} className="action-btn" title="Save" style={{ color: 'var(--success)' }}>
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="action-btn" title="Cancel" style={{ color: 'var(--danger)' }}>
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        /* DISPLAY MODE ROW */
                                        <tr key={tx._id}>
                                            <td>{new Date(tx.date).getDate()}</td>
                                            <td className="tx-income">{tx.generalOffering || '-'}</td>
                                            <td className="tx-income">{tx.specialOffering || '-'}</td>
                                            <td className="text-sm text-muted">{tx.specialOfferingNames || '-'}</td>
                                            <td className="tx-income">{tx.tithe || '-'}</td>
                                            <td className="text-sm text-muted">{tx.titheNames || '-'}</td>
                                            <td className="tx-expense">{tx.expenses || '-'}</td>
                                            <td className="text-sm text-muted">{tx.expenseDetails || '-'}</td>
                                            <td className="text-sm text-muted">{tx.remarks || '-'}</td>
                                            <td>
                                                {tx.proofUrl ? (
                                                    <a href={`http://localhost:5000${tx.proofUrl}`} target="_blank" rel="noreferrer" className="proof-link">
                                                        <FontAwesomeIcon icon={faEye} /> View
                                                    </a>
                                                ) : <span className="text-muted">—</span>}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => startEdit(tx)} className="action-btn edit-btn" title="Edit">
                                                        <FontAwesomeIcon icon={faPen} />
                                                    </button>
                                                    <button onClick={() => handleDelete(tx._id)} className="action-btn delete-btn" title="Delete">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                ))
                            )}

                            {/* Add Row at bottom */}
                            {isAddingRow && (
                                <tr className="add-row-highlight">
                                    <td>{daySelector(newTx.day, handleNewTxChange)}</td>
                                    <td>{inlineInput('generalOffering', newTx.generalOffering, handleNewTxChange, 'number', '0')}</td>
                                    <td>{inlineInput('specialOffering', newTx.specialOffering, handleNewTxChange, 'number', '0')}</td>
                                    <td>{inlineInput('specialOfferingNames', newTx.specialOfferingNames, handleNewTxChange, 'text', 'Names...')}</td>
                                    <td>{inlineInput('tithe', newTx.tithe, handleNewTxChange, 'number', '0')}</td>
                                    <td>{inlineInput('titheNames', newTx.titheNames, handleNewTxChange, 'text', 'Names...')}</td>
                                    <td>{inlineInput('expenses', newTx.expenses, handleNewTxChange, 'number', '0')}</td>
                                    <td>{inlineInput('expenseDetails', newTx.expenseDetails, handleNewTxChange, 'text', 'Details...')}</td>
                                    <td>{inlineInput('remarks', newTx.remarks, handleNewTxChange, 'text', 'Remarks...')}</td>
                                    <td>
                                        <input type="file" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files[0])} className="inline-file-input" />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={handleSaveRow} disabled={isSubmitting} className="action-btn" title="Save" style={{ color: 'var(--success)' }}>
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                            <button onClick={handleCancelRow} className="action-btn" title="Cancel" style={{ color: 'var(--danger)' }}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        {/* Totals Footer */}
                        {transactions.length > 0 && (
                            <tfoot>
                                <tr className="totals-row">
                                    <td><strong>Total</strong></td>
                                    <td className="tx-income"><strong>{totals.generalOffering.toLocaleString()}</strong></td>
                                    <td className="tx-income"><strong>{totals.specialOffering.toLocaleString()}</strong></td>
                                    <td></td>
                                    <td className="tx-income"><strong>{totals.tithe.toLocaleString()}</strong></td>
                                    <td></td>
                                    <td className="tx-expense"><strong>{totals.expenses.toLocaleString()}</strong></td>
                                    <td></td>
                                    <td colSpan="3">
                                        <strong>Total Offerings:</strong> {totalOfferings.toLocaleString()} &nbsp;|&nbsp;
                                        <strong style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>Balance: {balance.toLocaleString()}</strong>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
