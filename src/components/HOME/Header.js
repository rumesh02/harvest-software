import React, { useState, useEffect } from "react";
import "../../styles/header.css";
import LanguageSelector from "./LanguageSelector";
import { FaBell } from "react-icons/fa"; // Import notification bell icon

const Header = ({ language, setLanguage }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Toggle Dark/Light mode
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const [notifications, setNotifications] = useState(3);

    // Apply dark mode to the body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [isDarkMode]);

    return (
        <header className="header-container">
            <div className="logo-section">
                <img src="/favicon.ico" alt="Farm to Market Logo" className="logo" />
                <h1 className="app-name">AgriLink</h1>
            </div>

            {/* Notification Icon */}
            <div className="notification-container">
                <FaBell className="notification-icon" />
                {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </div>

            {/* Dark Mode Switcher */}
            <div className="dark-mode-switcher" onClick={toggleDarkMode}>
                <span className={`moon-icon left-moon ${isDarkMode ? "hidden" : ""}`}></span>
                <span className={`moon-icon right-moon ${isDarkMode ? "" : "hidden"}`}></span>
            </div>

            {/* Language Selector */}
            <LanguageSelector language={language} setLanguage={setLanguage} />

            {/* Login and Register Buttons */}
            <div className="header-buttons">
                <button className="header-button">Login</button>
                <button className="header-button">Sign Up</button>
            </div>
        </header>
    );
};

export default Header;
