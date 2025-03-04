import React, { useRef, useState, useEffect } from "react";
import "../../styles/aboutUs.css";
import aboutUsImage from "../../assets/about-us.jpg";



const AboutUs = () => {

    const aboutUsRef = useRef(null);
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

        if (aboutUsRef.current) observer.observe(aboutUsRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={aboutUsRef} className={`about-us-container ${isVisible ? "animate" : ""}`}>
            <div className="about-us-content">
                <div className="text-content">
                    <h2>About Us</h2>
                    <p>
                        AgriLink connects Farmers, Merchants, and Transporters for a seamless harvest journey.
                        By eliminating middlemen, we ensure fair pricing and efficient transactions.
                    </p>
                    <ul>
                        <li>Empowers farmers by providing direct marketplace access.</li>
                        <li>Merchants can filter, bid, and buy harvests securely.</li>
                        <li>Transporters streamline delivery for a complete ecosystem.</li>
                    </ul>
                </div>
                <div className="image-content">
                    <img src={aboutUsImage} alt="About Us" />
                </div>
            </div>
        </div>
    );
};

export default AboutUs;