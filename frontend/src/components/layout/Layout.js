import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import './LayoutStyles.css';

const Layout = () => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-wrapper">
                <Header />
                <main className="dashboard-content animate-fade-in">
                    <Outlet /> {/* Renders inner Dashboard pages */}
                </main>
            </div>
        </div>
    );
};

export default Layout;
