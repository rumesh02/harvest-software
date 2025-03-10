import React, { useState, useEffect } from "react";
import "../../styles/header.css";
import LanguageSelector from "./LanguageSelector";
import { FaBell } from "react-icons/fa"; // Import notification bell icon

const Header = ({ language, setLanguage }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState("medium");

    // Toggle Dark/Light mode
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const [notifications, setNotifications] = useState(3);

    const changeFontSize = (size) => {
        setFontSize(size);
        document.body.style.fontSize = size === "small" ? "14px" : size === "medium" ? "16px" : "18px";
    };

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

            {/* Font Size Switcher */}
            <div className="font-size-switcher">
                <button className={fontSize === "small" ? "active" : ""}
                        onClick={() => changeFontSize("small")}
                        style={{ fontSize: "10px" }}>
                    A
                </button>
                <button className={fontSize === "medium" ? "active" : ""}
                        onClick={() => changeFontSize("medium")}
                        style={{ fontSize: "12px" }}>
                    A
                </button>
                <button className={fontSize === "large" ? "active" : ""}
                        onClick={() => changeFontSize("large")}
                        style={{ fontSize: "15px" }}>
                    A
                </button>
            </div>


            {/* Dark Mode Switcher */}
            <div className="dark-mode-switcher" onClick={toggleDarkMode}>
                <span className={`moon-icon left-moon ${isDarkMode ? "hidden" : ""}`}></span>
                <span className={`moon-icon right-moon ${isDarkMode ? "" : "hidden"}`}></span>
            </div>

            {/* Language Selector */}
            <LanguageSelector language={language} setLanguage={setLanguage} />



        </header>
    );
};

export default Header;
