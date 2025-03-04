import React, { useState } from "react";
import "../../styles/menuBar.css"; // Make sure the path is correct
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const MenuBar = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [iconActive, setIconActive] = useState(false);
    const navigate = useNavigate();

    // Toggle the visibility of the menu and icon transformation
    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
        setIconActive(!iconActive); // Toggle the icon transformation
    };
    // Navigation handler function
    const handleNavigation = (path) => {
        navigate(path); // Navigate to the given path
        setMenuVisible(false); // Close the dropdown after clicking
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
                        <button onClick={() => handleNavigation("/about")}>About Us</button>
                    </li>
                    <li>
                        <button onClick={() => handleNavigation("/contact")}>Contact Us</button>
                    </li>
                    <li>
                        <button onClick={() => handleNavigation("/services")}>Services</button>
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
