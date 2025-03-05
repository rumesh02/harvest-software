import React, { useRef, useState, useEffect } from "react";
import "../../styles/contactUs.css";
import contactUsImage from "../../assets/contact-us.jpg";

const ContactUs = () => {
    const contactUsRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 } // Trigger when 30% of the section is visible
        );

        if (contactUsRef.current) observer.observe(contactUsRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={contactUsRef} className={`contact-us-container ${isVisible ? "animate" : ""}`}>
            <div className="contact-us-content">
                <div className="text-content">
                    <h2>Contact Us</h2>
                    <p>
                        Have questions or need assistance? Reach out to us!
                        We’re here to support you.
                    </p>
                    <ul>
                        <li>Email: support@agrilink.com</li>
                        <li>Phone: +1 (555) 123-4567</li>
                        <li>Location: 123 AgriLink Street, Greenfield</li>
                    </ul>
                </div>
                <div className="image-content">
                    <img src={contactUsImage} alt="Contact Us" />
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
