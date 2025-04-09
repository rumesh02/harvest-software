import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function RegisterPage() {
  return (
    <div className="container-fluid vh-100 p-0"> {/* Removed padding to fix the gap */}
      <div className="row h-100 m-0"> {/* Removed margin */}
        
        {/* Left Image Section */}
        <div className="col-lg-6 d-none d-lg-block position-relative p-0"> {/* Added p-0 to remove padding */}
          <img
            src={`${process.env.PUBLIC_URL}/Images/farmerregistation.jpg`}
            alt="Farmer using phone"
            className="w-100 h-100 object-fit-cover"
          />
          <div className="position-absolute bottom-0 start-0 text-white p-4">
            <h5 className="fw-bold">Register Now To Grow Your Connections!</h5>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center">
          <div className="w-75">
            <h2 className="fw-bold text-dark mb-4">Create Account</h2>

            <form>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input type="text" className="form-control" placeholder="First Name" />
                </div>
                <div className="col-md-6 mb-3">
                  <input type="text" className="form-control" placeholder="Last Name" />
                </div>
              </div>

              <div className="mb-3">
                <input type="email" className="form-control" placeholder="Email" />
              </div>

              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Phone Number" />
              </div>

              <div className="mb-3">
                <input type="text" className="form-control" placeholder="NIC" />
              </div>

              <div className="mb-3">
                <label className="d-block fw-bold">Gender</label>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="gender" id="male" />
                  <label className="form-check-label" htmlFor="male">Male</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="gender" id="female" />
                  <label className="form-check-label" htmlFor="female">Female</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="gender" id="other" />
                  <label className="form-check-label" htmlFor="other">Other</label>
                </div>
              </div>

              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Address" />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <select className="form-select">
                    <option>Province</option>
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
                  <select className="form-select">
                    <option>District</option>
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

              <div>
                <div className="mb-5">
                  <select className="form-select">
                    <option>Role</option>
                    <option>Farmer</option>
                    <option>Merchant</option>
                    <option>Transporter</option>
                  </select>
                </div>
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
