import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const ProfilePage = ({ SidebarComponent = Sidebar }) => {
  const { user, isAuthenticated } = useAuth0();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    picture: "",
    nic: "",
    gender: "",
    address: "",
    province: "",
    district: "",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user?.sub) {
        try {
          const res = await axios.get(`/api/users/${user.sub}`);
          setProfile({
            name: res.data.name || "",
            email: res.data.email || user.email,
            phone: res.data.phone || "",
            picture: res.data.picture || user.picture || "",
            nic: res.data.nic || "",
            gender: res.data.gender || "",
            address: res.data.address || "",
            province: res.data.province || "",
            district: res.data.district || "",
          });
        } catch (error) {
          console.error("User not found or server error", error);
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/users/${user.sub}`, profile);
      if (response.status === 200 || response.status === 204) {
        alert("Profile updated successfully!");
        setEditing(false);
      } else {
        alert("Unexpected server response.");
      }
    } catch (error) {
      console.error("Save error:", error);
      if (error.response?.status === 404) {
        alert("User not found. Please register first.");
      } else {
        alert(error.response?.data?.error || "Failed to save changes.");
      }
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      {/* Inline CSS for hover effect */}
      <style>
        {`
        .profile-img-hover-group:hover .profile-img-hover-label {
          opacity: 1;
        }
      `}
      </style>
      <Navbar />
      <div className="row min-vh-100">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 p-0 bg-light">
          <SidebarComponent userRole={profile.role || "Farmer"} />
        </div>

        {/* Profile Edit Section */}
        <div className="col-md-9 col-lg-10 d-flex align-items-center justify-content-center">
          <div className="w-100">
            <div
              className="card shadow-lg border-0 mx-auto"
              style={{
                background: "linear-gradient(135deg, #e9f7ef 0%, #fdf6fb 100%)",
                borderRadius: "2rem",
                padding: "2.5rem 2rem",
                maxWidth: "900px",
                width: "100%",
              }}
            >
              <div className="card-body text-center">
                {/* Profile Image Section */}
                <div className="mb-4 d-flex flex-column align-items-center justify-content-center">
                  <div
                    style={{
                      position: "relative",
                      width: "140px",
                      height: "140px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className={editing ? "profile-img-hover-group" : ""}
                  >
                    <img
                      src={profile.picture || "/placeholder.svg"}
                      alt="Profile"
                      className="rounded-circle border border-3 border-success shadow"
                      style={{
                        width: "140px",
                        height: "140px",
                        objectFit: "cover",
                        marginBottom: "1rem",
                        display: "block",
                      }}
                    />
                    {editing && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePictureChange}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "140px",
                            height: "140px",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 2,
                            pointerEvents: "auto",
                          }}
                          title="Choose profile picture"
                          className="profile-img-hover-input"
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            pointerEvents: "none",
                            fontSize: "1rem",
                            opacity: 0,
                            transition: "opacity 0.2s",
                            zIndex: 3,
                          }}
                          className="profile-img-hover-label"
                        >
                          Choose file
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <h2 className="mb-2 fw-bold" style={{ fontSize: "2rem" }}>
                  {profile.name}
                </h2>
                <p className="mb-3 text-muted" style={{ fontSize: "1.2rem" }}>
                  {profile.email}
                </p>

                {/* Editable Form */}
                {editing ? (
                  <form onSubmit={handleSave}>
                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control form-control-lg"
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>

                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control form-control-lg"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>

                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold">Gender</label>
                      <select
                        name="gender"
                        className="form-select form-select-lg"
                        value={profile.gender}
                        onChange={handleChange}
                        disabled={!editing}
                      >
                        <option value="">Select Gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold">Address</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control form-control-lg"
                        value={profile.address}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>

                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold">Province</label>
                      <input
                        type="text"
                        name="province"
                        className="form-control form-control-lg"
                        value={profile.province}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>

                    <div className="mb-4 text-start">
                      <label className="form-label fw-semibold">District</label>
                      <input
                        type="text"
                        name="district"
                        className="form-control form-control-lg"
                        value={profile.district}
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 shadow-sm"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-100 shadow-sm"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
