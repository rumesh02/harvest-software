import React, { useState } from 'react';
import { useEffect, useState as useStateAlt } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const { user } = useAuth0();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nic: '',
    gender: '',
    address: '',
    province: '',
    district: '',
    role: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (e) => {
    setFormData((prev) => ({ ...prev, gender: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullName = `${formData.firstName} ${formData.lastName}`;
    const payload = {
      auth0Id: user.sub,
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      nic: formData.nic,
      gender: formData.gender,
      address: formData.address,
      province: formData.province,
      district: formData.district,
      role: formData.role
    };

    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        localStorage.setItem('userRole', formData.role);

        if (formData.role === 'farmer') navigate('/');
        else if (formData.role === 'merchant') navigate('/merchant/dashboard');
        else if (formData.role === 'transporter') navigate('/transporter/dashboard');
      } else {
        console.error('Registration failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Animation states
  const [imgVisible, setImgVisible] = useStateAlt(false);
  const [formVisible, setFormVisible] = useStateAlt(false);

  useEffect(() => {
    setTimeout(() => setImgVisible(true), 200);
    setTimeout(() => setFormVisible(true), 500);
  }, []);

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <div className="d-none d-lg-block position-relative" style={{ flex: '1 1 0%', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <img
            src={`${process.env.PUBLIC_URL}/Images/Registerpage.jpg`}
            alt="Farmer using phone"
            style={{
              height: '100vh',
              width: '50vw',
              objectFit: 'cover',
              borderRadius: '0px',
              maxWidth: '100%',
              opacity: imgVisible ? 1 : 0,
              transform: imgVisible ? 'scale(1)' : 'scale(1.05)',
              transition: 'opacity 2s cubic-bezier(.4,0,.2,1), transform 2s cubic-bezier(.4,0,.2,1)'
            }}
          />
        </div>
        <div className="position-absolute bottom-0 start-0 text-white p-4">
          <h5 className="fw-bold">Register Now To Grow Your Connections!</h5>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-center" style={{ flex: '1 1 0%', minWidth: 0, minHeight: '100vh', background: '#fff' }}>
        <div className="w-100" style={{ maxWidth: 480, width: '100%', padding: '16px 8px', maxHeight: '100vh', opacity: formVisible ? 1 : 0, transform: formVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 1.8s cubic-bezier(.4,0,.2,1), transform 1.8s cubic-bezier(.4,0,.2,1)' }}>
          <h2 className="fw-bold mb-4" style={{ letterSpacing: '1px', fontSize: '2rem', textAlign: 'center', color: '#198754', fontWeight: 700 }}>Create Account</h2>

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="row" style={{ marginBottom: '8px' }}>
              <div className="col-md-6 mb-2">
                <input type="text" name="firstName" className="form-control" placeholder="First Name" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }} />
              </div>
              <div className="col-md-6 mb-2">
                <input type="text" name="lastName" className="form-control" placeholder="Last Name" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }} />
              </div>
            </div>

            <div className="mb-2">
              <input type="email" name="email" className="form-control" placeholder="Email" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }} />
            </div>

            <div className="mb-2">
              <input type="text" name="phone" className="form-control" placeholder="Phone Number" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }} />
            </div>

            <div className="mb-2">
              <input type="text" name="nic" className="form-control" placeholder="NIC" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }} />
            </div>

            <div className="mb-2">
              <label className="d-block fw-bold" style={{ marginBottom: '4px' }}>Gender</label>
              {['Male', 'Female', 'Other'].map((g) => (
                <div className="form-check form-check-inline" key={g} style={{ marginRight: '8px' }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    value={g}
                    onChange={handleGenderChange}
                    required
                    style={{ marginRight: '2px' }}
                  />
                  <label className="form-check-label" style={{ fontSize: '15px' }}>{g}</label>
                </div>
              ))}
            </div>

            <div className="mb-2">
              <input type="text" name="address" className="form-control" placeholder="Address" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }} />
            </div>

            <div className="row" style={{ marginBottom: '8px' }}>
              <div className="col-md-6 mb-2">
                <select className="form-select" name="province" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }}>
                  <option value="">Province</option>
                  <option>Western</option>
                  <option>Central</option>
                  <option>Southern</option>
                  <option>Northern</option>
                  <option>Eastern</option>
                  <option>North-Western</option>
                  <option>Uva</option>
                  <option>Sabaragamuwa</option>
                </select>
              </div>
              <div className="col-md-6 mb-2">
                <select className="form-select" name="district" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }}>
                  <option value="">District</option>
                  <option>Colombo</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                  <option>Matara</option>
                  <option>Jaffna</option>
                  <option>Trincomalee</option>
                  <option>Puttalam</option>
                  <option>Polonnaruwa</option>
                  <option>Kilinochchi</option>
                  <option>Bandaragama</option>
                  <option>Matale</option>
                  <option>Ampara</option>
                  <option>Badulla</option>
                  <option>Monaragala</option>
                  <option>Kurunegala</option>
                  <option>Mannar</option>
                  <option>Batticaloa</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <select className="form-select" name="role" onChange={handleChange} required style={{ padding: '6px', fontSize: '15px' }}>
                <option value="">Role</option>
                <option value="farmer">Farmer</option>
                <option value="merchant">Merchant</option>
                <option value="transporter">Transporter</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success w-100" style={{ padding: '8px', fontSize: '16px' }}>
              Create Account
            </button>
            <style>{`
              .btn-success.w-100:hover {
                background: linear-gradient(90deg,#3a5a40,#a3b18a);
                color: #fff;
                box-shadow: 0 4px 16px rgba(58,90,64,0.12);
                transform: scale(1.03);
                transition: all 0.3s cubic-bezier(.4,0,.2,1);
              }
            `}</style>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
