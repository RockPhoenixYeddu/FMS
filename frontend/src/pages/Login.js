import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css'; // We'll create specific CSS for auth

const Login = () => {
    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already logged in
    if (isAuthenticated) {
        navigate('/dashboard');
    }

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setIsSubmitting(false);
            return;
        }

        const { success, msg } = await login(email, password);

        if (success) {
            navigate('/dashboard');
        } else {
            setError(msg);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">FMS</div>
                    <h2>Admin Access</h2>
                    <p className="auth-subtitle">Welcome back. Please login to manage the organization's finances.</p>
                </div>

                {error && <div className="auth-alert bg-danger">{error}</div>}

                <form onSubmit={onSubmit} className="auth-form">
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

                    <button
                        type="submit"
                        className="btn-primary auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        New Organization Setup? <Link to="/register" style={{ color: 'var(--accent-secondary)' }}>Register Super Admin</Link>
                    </p>
                </form>
            </div>

            {/* Decorative background elements */}
            <div className="glow-sphere glow-1"></div>
            <div className="glow-sphere glow-2"></div>
        </div>
    );
};

export default Login;
