import React, { useRef, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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

  const services = [
    { title: "Harvest Listings", description: "Farmers can list their harvests with detailed information" },
    { title: "Bidding System", description: "Merchants can place competitive bids on available produce" },
    { title: "Transport Coordination", description: "Transporters can offer shipping services for completed transactions" },
    { title: "Secure Payments", description: "Our platform ensures secure and timely payments for all parties" }
  ];

  // Inline styles
  const sectionStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #059669 100%)',
    borderRadius: '1rem',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
    transition: 'opacity 1s ease-out, transform 1s ease-out',
    padding: '4rem 0'
  };

  const contentLeftStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
    transition: 'opacity 1s ease-out, transform 1s ease-out'
  };

  const imageRightStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
    transition: 'opacity 1s ease-out, transform 1s ease-out'
  };

  const titleStyle = {
    color: '#161245ff',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    fontSize: '3rem',
    fontWeight: '800'
  };

  const leadStyle = {
    color: 'rgba(24, 20, 98, 0.9)',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
    fontSize: '1.2rem',
    lineHeight: '1.6'
  };

  const serviceCardStyle = {
    height: '100%',
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    minHeight: '160px'
  };

  const imageStyle = {
    width: '85%',
    maxWidth: '500px',
    borderRadius: '1.5rem',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'transform 0.3s ease'
  };

  const cardTitleStyle = {
    color: '#ffffff',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
    fontSize: '1.1rem',
    fontWeight: '700'
  };

  const cardTextStyle = {
    color: 'rgba(255, 255, 255, 0.85)',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
    fontSize: '0.95rem',
    lineHeight: '1.5'
  };

  return (
    <>
      <style>
        {`
          .service-card-hover:hover {
            transform: translateY(-5px) !important;
            background-color: #1e40af !important;
            box-shadow: 0 8px 25px rgba(30, 58, 138, 0.5) !important;
          }
        `}
      </style>
      <section 
        id="service" 
        ref={servicesRef}
        className="py-5 mb-4 text-white rounded"
        style={sectionStyle}
      >
        <div className="container">
          <div className="row align-items-center g-4">
            {/* Left Content Column */}
            <div className="col-12 col-md-6" style={contentLeftStyle}>
              <h2 className="display-4 fw-bold mb-3" style={titleStyle}>
                Our Services
              </h2>
              <p className="lead mb-4" style={leadStyle}>
                We provide a comprehensive suite of services connecting all parts of the agricultural supply chain.
              </p>
              
              {/* Services Grid */}
              <div className="row g-3">
                {services.map((service, index) => (
                  <div key={index} className="col-12 col-sm-6">
                    <div 
                      className="card h-100 border-0 service-card-hover"
                      style={serviceCardStyle}
                    >
                      <div className="card-body p-3 d-flex flex-column">
                        <h6 className="card-title fw-bold mb-2" style={cardTitleStyle}>
                          {service.title}
                        </h6>
                        <p className="card-text small flex-grow-1" style={cardTextStyle}>
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Image Column */}
            <div className="col-12 col-md-6 text-center" style={imageRightStyle}>
              <img
                src="/Images/home/services.jpg"
                alt="Our Services"
                className="img-fluid rounded-3 shadow-lg"
                style={imageStyle}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
