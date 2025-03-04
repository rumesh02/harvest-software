import React from "react";
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa";
import "../../styles/footer.css";

const Footer = () => {
    return (
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
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://twitter.com" className="twitter" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="https://wa.me/yourwhatsapplink" className="whatsapp" target="_blank"
                           rel="noopener noreferrer">
                            <i className="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>


            </div>

            <div className="copyright">
                <p>&copy; {new Date().getFullYear()} AgriLink. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
