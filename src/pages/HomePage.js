import React, { useState } from "react";
import Header from "../components/HOME/Header"; // Import the Header
import MenuBar from "../components/HOME/MenuBar";
import bgImage from "../assets/bg.png";
import farmerHome from "../assets/farmer home.jpg";
import merchantHome from "../assets/merchant home.jpeg";
import transporterHome from "../assets/transporter home.jpeg";
import "../styles/homePage.css";
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";
//import "../styles/footer.css";

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
                <p>Your One-Stop Platform for Connecting Farmers, Merchants, and Transporters – Ensuring a Seamless Harvest Journey!</p>

                <div className="tile-container">
                    <div className="tile">
                        <img src={farmerHome} alt="Farmer" className="tile-image"/>
                        <h3>Farmers</h3>
                        <p>Empowering you by Maximizing your harvest's value – List your produce, get the best bids, and sell directly to trusted merchants!</p>
                        <a href="/signup?role=farmer" className="btn">Get Started</a>
                    </div>
                    <div className="tile">
                        <img src={merchantHome} alt="Merchant" className="tile-image"/>
                        <h3>Merchant</h3>
                        <p>Access a wide variety of fresh harvests, place bids with ease, arrange seamless delivery and expand your business – all in one place!</p>
                        <a href="/signup?role=merchant" className="btn">Get Started</a>
                    </div>
                    <div className="tile">
                        <img src={transporterHome} alt="Transporter" className="tile-image"/>
                        <h3>Transporters</h3>
                        <p>Expand your transport services by connecting with farmers and merchants – secure new delivery requests every day.</p>
                        <a href="/signup?role=transporter" className="btn">Get Started</a>
                    </div>
                </div>

                <MenuBar/>
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
