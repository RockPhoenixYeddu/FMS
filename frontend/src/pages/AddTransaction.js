import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionContext } from '../context/TransactionContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinusCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import './AddTransaction.css';

const AddTransaction = () => {
    const { addTransaction } = useContext(TransactionContext);
    const navigate = useNavigate();

    // Core Form State
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'Expense',
        date: new Date().toISOString().split('T')[0],
        category: ''
    });

    // Dynamic Fields State
    const [customFields, setCustomFields] = useState([]);

    // File Upload State
    const [file, setFile] = useState(null);

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle Standard Inputs
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Custom Fields Logic
    const handleAddCustomField = () => {
        setCustomFields([...customFields, { key: '', value: '' }]);
    };

    const handleCustomFieldChange = (index, event) => {
        const updatedFields = [...customFields];
        updatedFields[index][event.target.name] = event.target.value;
        setCustomFields(updatedFields);
    };

    const removeCustomField = (index) => {
        const updatedFields = [...customFields];
        updatedFields.splice(index, 1);
        setCustomFields(updatedFields);
    };

    // Submit Logic (Using FormData since we have a file upload)
    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Convert custom fields array into an object for the backend mapping
        const customFieldsObj = {};
        customFields.forEach(field => {
            if (field.key && field.value) {
                customFieldsObj[field.key] = field.value;
            }
        });

        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('amount', formData.amount);
        submitData.append('type', formData.type);
        submitData.append('date', formData.date);
        submitData.append('category', formData.category);
        submitData.append('customFields', JSON.stringify(customFieldsObj));

        if (file) {
            submitData.append('proof', file);
        }

        const res = await addTransaction(submitData);

        if (res.success) {
            navigate('/dashboard/transactions');
        } else {
            setError(res.msg || 'An error occurred adding the transaction.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-transaction-page animate-fade-in">
            <div className="page-header">
                <h1>Add New Record</h1>
                <p className="text-muted">Enter financial data, attach proofs, and add custom tracking fields.</p>
            </div>

            <div className="card form-card">
                {error && <div className="alert-danger">{error}</div>}

                <form onSubmit={onSubmit} className="complex-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input type="text" name="title" className="form-input" value={formData.title} onChange={handleInputChange} required placeholder="e.g. Server Hosting" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount ($)</label>
                            <input type="number" name="amount" className="form-input" value={formData.amount} onChange={handleInputChange} required placeholder="50.00" min="0" step="0.01" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Transaction Type</label>
                            <select name="type" className="form-input" value={formData.type} onChange={handleInputChange}>
                                <option value="Expense">Expense</option>
                                <option value="Income">Income</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <input type="text" name="category" className="form-input" value={formData.category} onChange={handleInputChange} required placeholder="IT Infrastructure" />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Date</label>
                            <input type="date" name="date" className="form-input" value={formData.date} onChange={handleInputChange} required />
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="custom-fields-section">
                        <div className="section-header">
                            <h3>Custom Tracking Fields</h3>
                            <button type="button" onClick={handleAddCustomField} className="btn-secondary add-custom-btn">
                                <FontAwesomeIcon icon={faPlus} /> Add Field
                            </button>
                        </div>

                        {customFields.length === 0 && (
                            <p className="text-muted text-sm pb-10">Optional: Add custom properties (e.g. Tax ID, Department, Project Code)</p>
                        )}

                        {customFields.map((field, index) => (
                            <div key={index} className="custom-field-row animate-fade-in">
                                <input
                                    type="text"
                                    name="key"
                                    className="form-input"
                                    placeholder="Field Name (e.g. Tax ID)"
                                    value={field.key}
                                    onChange={(e) => handleCustomFieldChange(index, e)}
                                />
                                <input
                                    type="text"
                                    name="value"
                                    className="form-input"
                                    placeholder="Value (e.g. 1928-112)"
                                    value={field.value}
                                    onChange={(e) => handleCustomFieldChange(index, e)}
                                />
                                <button type="button" onClick={() => removeCustomField(index)} className="icon-btn remove-field text-danger">
                                    <FontAwesomeIcon icon={faMinusCircle} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <hr className="divider" />

                    <div className="file-upload-section">
                        <h3>Proof of Transaction</h3>
                        <p className="text-muted text-sm pb-10">Securely attach a receipt, invoice, or PDF confirmation.</p>

                        <div className="upload-box">
                            <input
                                type="file"
                                id="proofUpload"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden-file-input"
                                accept=".pdf, image/*"
                            />
                            <label htmlFor="proofUpload" className="upload-label">
                                <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                                <span className="upload-text">
                                    {file ? file.name : 'Click to select a file (Image or PDF)'}
                                </span>
                                <span className="btn-primary upload-btn-sm">Browse</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions mt-20">
                        <button type="button" onClick={() => navigate('/dashboard/transactions')} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransaction;
