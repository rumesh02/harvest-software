import React, { useState } from "react";
import "../../styles/menuBar.css";
import { useNavigate } from "react-router-dom";

const MenuBar = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [iconActive, setIconActive] = useState(false);
    const navigate = useNavigate();

    // Toggle the visibility of the menu and icon transformation
    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
        setIconActive(!iconActive);
    };

    // Navigation handler function
    const handleNavigation = (path) => {
        navigate(path);
        setMenuVisible(false);
        setIconActive(false);
    };

    // Scroll to About Us section
    const handleScrollToAbout = () => {
        const aboutSection = document.getElementById("about");
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: "smooth" });
        }
        setMenuVisible(false);
        setIconActive(false);
    };

    // Scroll to Contact Us section
    const handleScrollToContact = () => {
        const contactSection = document.getElementById("contact");
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth" });
        }
        setMenuVisible(false);
        setIconActive(false);
    };

    // Scroll to Services section
    const handleScrollToServices = () => {
        const servicesSection = document.getElementById("service");
        if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: "smooth" });
        }
        setMenuVisible(false);
        setIconActive(false);
    };


    return (
        <div className="menu-bar-container">
            <button className={`menu-icon ${iconActive ? "active" : ""}`} onClick={toggleMenu}>
                {!iconActive && <span className="menu-text">Menu</span>}
                <div className="bar"></div>
                <div className="bar"></div>
            </button>

            <div className={`menu-dropdown ${menuVisible ? "show" : ""}`}>
                <ul>
                    <li>
                        <button onClick={handleScrollToAbout}>About Us</button>
                    </li>
                    <li>
                        <button onClick={handleScrollToContact}>Contact Us</button>
                    </li>
                    <li>
                        <button onClick={handleScrollToServices}>Services</button>
                    </li>
                    <li>
                        <button onClick={() => handleNavigation("/successStories")}>Success Stories</button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default MenuBar;
