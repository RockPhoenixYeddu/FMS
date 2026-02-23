import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const { register, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'SuperAdmin' // Defaulting to SuperAdmin for initial setup
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already logged in
    if (isAuthenticated) {
        navigate('/dashboard');
    }

    const { name, email, password, role } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!name || !email || !password) {
            setError('Please fill in all fields');
            setIsSubmitting(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsSubmitting(false);
            return;
        }

        const { success, msg } = await register(name, email, password, role);

        if (success) {
            navigate('/dashboard');
        } else {
            setError(msg);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in" style={{ maxWidth: '480px' }}>
                <div className="auth-header">
                    <div className="auth-logo">FMS</div>
                    <h2>Setup Admin Account</h2>
                    <p className="auth-subtitle">Create the master Super Admin account to begin managing the system.</p>
                </div>

                {error && <div className="auth-alert bg-danger">{error}</div>}

                <form onSubmit={onSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={name}
                            onChange={onChange}
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={email}
                            onChange={onChange}
                            placeholder="admin@organization.org"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={password}
                            onChange={onChange}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="form-group" style={{ display: 'none' }}>
                        {/* Hidden role selector, defaults to SuperAdmin for setup */}
                        <label className="form-label">Role</label>
                        <select name="role" className="form-input" value={role} onChange={onChange}>
                            <option value="SuperAdmin">Super Admin</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent-secondary)' }}>Log in here</Link>
                    </p>
                </form>
            </div>

            {/* Decorative background elements */}
            <div className="glow-sphere glow-1"></div>
            <div className="glow-sphere glow-2"></div>
        </div>
    );
};

export default Register;
