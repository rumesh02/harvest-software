import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../components/HOME/Header";
import AboutUs from "../components/HOME/AboutUs";
import ContactUs from "../components/HOME/ContactUs";
import Services from "../components/HOME/Services";
import farmerHome from "../assets/farmer home.jpg";
import merchantHome from "../assets/merchant home.jpeg";
import transporterHome from "../assets/transporter home.jpeg";
import "../styles/homePage.css";
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa";

const HomePage = () => {
    const [language, setLanguage] = useState("English");
    const [query, setQuery] = useState("");

    const navigate = useNavigate(); // Initialize useNavigate

    // Function to navigate to the login page
    const handleSignUpClick = () => {
        navigate("/login"); // Redirect to the login page
    };

    return (
        <div className="home-page-container">
            <Header
                language={language}
                setLanguage={setLanguage}
                query={query}
                setQuery={setQuery}
            />
            <div className="content">
                <h1>Welcome to Farmer to Market!</h1>
                <p>Your One-Stop Platform for Connecting Farmers, Merchants, and Transporters – Ensuring a Seamless
                    Harvest Journey!</p>

                <div className="tile-container">
                    <div className="tile">
                        <img src={farmerHome} alt="Farmer" className="tile-image"/>
                        <h3>Farmers</h3>
                        <p>Empowering you by Maximizing your harvest's value – List your produce, get the best bids, and
                            sell directly to trusted merchants!</p>
                    </div>
                    <div className="tile">
                        <img src={merchantHome} alt="Merchant" className="tile-image"/>
                        <h3>Merchants</h3>
                        <p>Access a wide variety of fresh harvests, place bids with ease, arrange seamless delivery and
                            expand your business – all in one place!</p>
                    </div>
                    <div className="tile">
                        <img src={transporterHome} alt="Transporter" className="tile-image"/>
                        <h3>Transporters</h3>
                        <p>Expand your transport services by connecting with farmers and merchants – secure new delivery
                            requests every day.</p>
                    </div>
                </div>

                {/* Sign Up Button - Redirects to Login Page */}
                <div className="get-started-container">
                    <button onClick={handleSignUpClick} className="btn get-started">Sign Up</button>
                </div>

                {/* About Us Section */}
                <div id="about">
                    <AboutUs/>
                </div>

                <div id="contact">
                    <ContactUs/>
                </div>

                <div id="service">
                    <Services/>
                </div>
            </div>

            <div className="chat-button">
                <a href="/chat" className="chat-icon">
                    <FaCommentDots />
                </a>
            </div>

            <footer className="footer">
                <div className="footer-container">
                    <div className="quick-links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="/terms">Terms of Service</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/faqs">FAQs</a></li>
                        </ul>
                    </div>
                    <div className="contact-info">
                        <h3>Contact Us</h3>
                        <p>Email: support@agrilink.com</p>
                        <p>Phone: +123 456 7890</p>
                    </div>
                    <div>
                        <h3>Follow Us</h3>
                        <div className="social-media">
                            <a href="https://facebook.com" className="facebook" target="_blank" rel="noopener noreferrer">
                                <FaFacebookF />
                            </a>
                            <a href="https://twitter.com" className="twitter" target="_blank" rel="noopener noreferrer">
                                <FaTwitter />
                            </a>
                            <a href="https://wa.me/yourwhatsapplink" className="whatsapp" target="_blank" rel="noopener noreferrer">
                                <FaWhatsapp />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    <p>&copy; {new Date().getFullYear()} Farmer to Market. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
