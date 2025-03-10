import React, { useRef, useState, useEffect } from "react";
import "../../styles/services.css";
import servicesImage from "../../assets/services.jpg";

const Services = () => {
    const servicesRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (servicesRef.current) observer.observe(servicesRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={servicesRef} className={`services-container ${isVisible ? "animate" : ""}`}>
            <div className="services-content">
                <div className="text-content">
                    <h2>Our Services</h2>
                    <p>
                        AgriLink provides a seamless platform for Farmers, Merchants, and Transporters
                        by offering integrated services that enhance efficiency and transparency.
                    </p>
                    <ul>
                        <li>Farmers can list their harvests and connect directly with buyers.</li>
                        <li>Merchants can browse, bid, and purchase high-quality produce securely.</li>
                        <li>Transporters ensure smooth logistics for timely and cost-effective delivery.</li>
                        <li>Real-time notifications for bids, payments, and transport updates.</li>
                        <li>Secure transactions with encrypted data protection.</li>
                    </ul>
                </div>
                <div className="image-content">
                    <img src={servicesImage} alt="Our Services" />
                </div>
            </div>
        </div>
    );
};

export default Services;
