import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './LayoutStyles.css';

const Header = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <header className="top-header">
            <div className="header-search">
                {/* Placeholder for future global search */}
            </div>

            <div className="header-actions">
                <button className="icon-btn">
                    <FontAwesomeIcon icon={faBell} />
                    <span className="badge">3</span>
                </button>

                <div className="user-profile">
                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'Admin'}</span>
                        <span className="user-role">{user?.role || 'User'}</span>
                    </div>
                </div>

                <button onClick={logout} className="logout-btn icon-btn" title="Logout">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
            </div>
        </header>
    );
};

export default Header;
