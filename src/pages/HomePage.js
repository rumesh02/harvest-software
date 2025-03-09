import React, { useState,  } from "react";
import Header from "../components/HOME/Header";
import MenuBar from "../components/HOME/MenuBar";
import AboutUs from "../components/HOME/AboutUs";
import ContactUs from "../components/HOME/ContactUs";
import Services from "../components/HOME/Services";
import bgImage from "../assets/bg.png";
import farmerHome from "../assets/farmer home.jpg";
import merchantHome from "../assets/merchant home.jpeg";
import transporterHome from "../assets/transporter home.jpeg";
import "../styles/homePage.css";
import { FaFacebookF, FaTwitter, FaWhatsapp, } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa";

const HomePage = () => {
    const [language, setLanguage] = useState("English");
    const [query, setQuery] = useState("");

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
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
                <h1>Welcome to AgriLink!</h1>
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

                {/* Single Get Started Button Below Tiles */}
                <div className="get-started-container">
                    <a href="/signup" className="btn get-started">Sign Up</a>
                </div>

                {/* About Us Section with ID for scrolling */}
                <div id="about">
                    <AboutUs/>
                </div>

                <div id="contact">
                    <ContactUs/>
                </div>

                <div id="service">
                    <Services/>
                </div>

                <MenuBar/>
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
                    <p>&copy; {new Date().getFullYear()} AgriLink. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
