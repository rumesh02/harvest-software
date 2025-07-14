import React, { useState } from 'react';
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

  if (!user || !user.sub) {
    // handle error or show loading
    return;
  }

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row h-100 m-0">
        <div className="col-lg-6 d-none d-lg-block position-relative p-0">
          <img
            src={`${process.env.PUBLIC_URL}/Images/farmerregistation.jpg`}
            alt="Farmer using phone"
            className="w-100 h-100 object-fit-cover"
          />
          <div className="position-absolute bottom-0 start-0 text-white p-4">
            <h5 className="fw-bold">Register Now To Grow Your Connections!</h5>
          </div>
        </div>

        <div className="col-lg-6 d-flex align-items-center justify-content-center">
          <div className="w-75">
            <h2 className="fw-bold text-dark mb-4">Create Account</h2>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input type="text" name="firstName" className="form-control" placeholder="First Name" onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <input type="text" name="lastName" className="form-control" placeholder="Last Name" onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-3">
                <input type="email" name="email" className="form-control" placeholder="Email" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <input type="text" name="phone" className="form-control" placeholder="Phone Number" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <input type="text" name="nic" className="form-control" placeholder="NIC" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="d-block fw-bold">Gender</label>
                {['Male', 'Female', 'Other'].map((g) => (
                  <div className="form-check form-check-inline" key={g}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      value={g}
                      onChange={handleGenderChange}
                      required
                    />
                    <label className="form-check-label">{g}</label>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <input type="text" name="address" className="form-control" placeholder="Address" onChange={handleChange} required />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <select className="form-select" name="province" onChange={handleChange} required>
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
                <div className="col-md-6 mb-3">
                  <select className="form-select" name="district" onChange={handleChange} required>
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

              <div className="mb-5">
                <select className="form-select" name="role" onChange={handleChange} required>
                  <option value="">Role</option>
                  <option value="farmer">Farmer</option>
                  <option value="merchant">Merchant</option>
                  <option value="transporter">Transporter</option>
                </select>
              </div>

              <button type="submit" className="btn btn-success w-100">
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
