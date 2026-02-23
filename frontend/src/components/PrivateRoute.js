import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
