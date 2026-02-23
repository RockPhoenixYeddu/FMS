import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faListUl, faPlusCircle, faCog } from '@fortawesome/free-solid-svg-icons';
import './LayoutStyles.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <h2>FMS<span className="text-accent">.</span></h2>
            </div>

            <div className="sidebar-menu">
                <NavLink to="/dashboard" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`} end>
                    <FontAwesomeIcon icon={faChartPie} className="menu-icon" />
                    <span>Overview</span>
                </NavLink>

                <NavLink to="/dashboard/transactions" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faListUl} className="menu-icon" />
                    <span>Transactions</span>
                </NavLink>
            </div>

            <div className="sidebar-footer">
                <div className="menu-item disabled">
                    <FontAwesomeIcon icon={faCog} className="menu-icon" />
                    <span>Settings</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
