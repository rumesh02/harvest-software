import React, { useState, useEffect } from "react";
import "../../styles/header.css";
import LanguageSelector from "./LanguageSelector";

const Header = ({ language, setLanguage }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Toggle Dark/Light mode
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Apply dark mode to the body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [isDarkMode]);

    // Function to scroll to a section smoothly
    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header className="header-container">
            {/* Left Section: AgriLink Logo & Name */}
            <div className="nav-left">
                <div className="logo-section">
                    <img src="/favicon.ico" alt="AgriLink Logo" className="logo" />
                    <h1 className="app-name">Farmer to Market</h1>
                </div>

                {/* Navigation Buttons */}
                <nav className="nav-buttons">
                    <button className="nav-button" onClick={() => scrollToSection("about")}>About Us</button>
                    <button className="nav-button" onClick={() => scrollToSection("contact")}>Contact Us</button>
                    <button className="nav-button" onClick={() => scrollToSection("service")}>Services</button>
                </nav>
            </div>

            {/* Right Section: Dark Mode Switch & Language Selector */}
            <div className="header-right">
                {/* Dark Mode Switcher */}
                <div className="dark-mode-switcher" onClick={toggleDarkMode}>
                    <span className={`moon-icon left-moon ${isDarkMode ? "hidden" : ""}`}></span>
                    <span className={`moon-icon right-moon ${isDarkMode ? "" : "hidden"}`}></span>
                </div>

                {/* Language Selector */}
                <LanguageSelector language={language} setLanguage={setLanguage} />
            </div>
        </header>
    );
};

export default Header;
