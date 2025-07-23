import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Spinner 
} from "react-bootstrap";
import { 
  PencilSquare, 
  Trash, 
  Truck, 
  Plus 
} from "react-bootstrap-icons";
import { getVehicles, updateVehicle, deleteVehicle } from "../../services/api";
import placeholderImage from "../../assets/lorry.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EditListed.css";

export default function EditListed() {
  const { user } = useAuth0();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editFields, setEditFields] = useState({
    vehicleType: "",
    licensePlate: "",
    loadCapacity: "",
    pricePerKm: "",
    file: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        // Use backend filtering instead of client-side filtering
        const data = await getVehicles(user.sub);
        console.log("Fetched vehicles data:", data); // Debug log
        console.log("📊 Price analysis:");
        data.forEach((vehicle, index) => {
          console.log(`${index + 1}. ${vehicle.vehicleType}:`);
          console.log(`   - Price/km: ${vehicle.pricePerKm}`);
          console.log(`   - Price type: ${typeof vehicle.pricePerKm}`);
          console.log(`   - Has price field: ${vehicle.hasOwnProperty('pricePerKm')}`);
          console.log(`   - Price valid: ${vehicle.pricePerKm && vehicle.pricePerKm > 0}`);
        });
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Failed to load vehicles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user]);

  // Open modal and populate fields
  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditFields({
      vehicleType: vehicle.vehicleType,
      licensePlate: vehicle.licensePlate,
      loadCapacity: vehicle.loadCapacity,
      pricePerKm: vehicle.pricePerKm || "",
      file: null,
    });
    setShowModal(true);
    setSaveError(null);
  };

  // Remove vehicle handler
  const handleRemove = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) return;
    try {
      await deleteVehicle(vehicleId);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
    } catch (err) {
      alert("Failed to remove vehicle.");
    }
  };

  // Handle input changes in modal
  const handleFieldChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setEditFields((prev) => ({ ...prev, file: files[0] }));
    } else {
      setEditFields((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateVehicle(selectedVehicle._id, editFields);
      setVehicles((prev) =>
        prev.map((v) => (v._id === updated._id ? updated : v))
      );
      setShowModal(false);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || "Failed to update vehicle. Try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div style={{ background: '#f9f9f9', minHeight: "100vh", paddingTop: '20px', paddingBottom: '20px' }}>
      <Container>
        {/* Header Section */}
        <div className="mb-4 text-center">
          <h2 className="fw-bold text-primary mb-2">Edit Listed Vehicles</h2>
          <p className="text-primary">Manage your transport vehicles</p>
        </div>

        {vehicles.length === 0 ? (
          <Card className="text-center p-4" style={{ background: 'rgba(255,255,255,0.9)', border: "1px solid #E5E7EB" }}>
            <Card.Body>
              <Truck size={60} className="text-muted mb-3" />
              <h5 className="mb-3 text-muted">No vehicles added yet</h5>
              <p className="mb-4 text-muted">Add your first vehicle to start receiving booking requests</p>
              <Button 
                variant="primary" 
                onClick={() => navigate("/transporter/add-vehicle")}
                className="px-4 py-2"
              >
                <Plus className="me-2" />
                Add Vehicle
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {vehicles.map((vehicle) => (
              <Col xs={12} sm={6} md={4} lg={3} key={vehicle._id}>
                <Card 
                  className="h-100 shadow-sm border-0 vehicle-card"
                  style={{ 
                    height: '380px',
                    transition: 'all 0.3s ease-in-out',
                    border: "2px solid #E3F2FD"
                  }}
                >
                  <div className="position-relative">
                    <Card.Img 
                      variant="top" 
                      src={vehicle.image || placeholderImage}
                      alt={vehicle.vehicleType}
                      style={{ 
                        height: '160px', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                    <div 
                      className="position-absolute top-0 end-0 m-2 px-3 py-1 rounded-pill text-white price-badge"
                      style={{ 
                        backgroundColor: vehicle.pricePerKm ? 'rgba(21, 101, 192, 0.95)' : 'rgba(220, 53, 69, 0.95)', 
                        fontSize: '12px',
                        fontWeight: '700',
                        boxShadow: vehicle.pricePerKm ? '0 2px 8px rgba(21, 101, 192, 0.3)' : '0 2px 8px rgba(220, 53, 69, 0.3)',
                        border: '2px solid white',
                        minWidth: '80px',
                        textAlign: 'center'
                      }}
                    >
                      {vehicle.pricePerKm && vehicle.pricePerKm > 0 
                        ? `LKR ${Math.round(parseFloat(vehicle.pricePerKm))}/km` 
                        : 'No Price Set'}
                    </div>
                  </div>

                  <Card.Body className="d-flex flex-column" style={{ height: '140px' }}>
                    <Card.Title 
                      className="text-center text-primary fw-bold mb-3"
                      style={{ 
                        fontSize: '16px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {vehicle.vehicleType}
                    </Card.Title>
                    
                    <div className="flex-grow-1">
                      <div 
                        className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                        style={{ 
                          backgroundColor: '#F8F9FA',
                          height: '28px'
                        }}
                      >
                        <small className="text-muted" style={{ fontSize: '11px' }}>License:</small>
                        <small 
                          className="text-primary fw-bold"
                          style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100px',
                            fontSize: '11px'
                          }}
                        >
                          {vehicle.licensePlate}
                        </small>
                      </div>
                      
                      <div 
                        className="d-flex justify-content-between align-items-center mb-2 p-2 rounded"
                        style={{ 
                          backgroundColor: '#F0F8FF',
                          height: '28px'
                        }}
                      >
                        <small className="text-muted" style={{ fontSize: '11px' }}>Capacity:</small>
                        <small 
                          className="text-success fw-bold"
                          style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100px',
                            fontSize: '11px'
                          }}
                        >
                          {vehicle.loadCapacity}
                        </small>
                      </div>

                      <div 
                        className="d-flex justify-content-between align-items-center p-2 rounded"
                        style={{ 
                          backgroundColor: vehicle.pricePerKm && vehicle.pricePerKm > 0 ? '#E8F5E8' : '#FFF5F5',
                          height: '28px',
                          border: vehicle.pricePerKm && vehicle.pricePerKm > 0 ? '1px solid #c8e6c9' : '1px solid #ffcdd2'
                        }}
                      >
                        <small className="text-muted" style={{ fontSize: '11px' }}>Price/km:</small>
                        <small 
                          className="fw-bold"
                          style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100px',
                            fontSize: '11px',
                            color: vehicle.pricePerKm && vehicle.pricePerKm > 0 ? '#28a745' : '#dc3545'
                          }}
                        >
                          {vehicle.pricePerKm && vehicle.pricePerKm > 0 
                            ? `LKR ${Math.round(parseFloat(vehicle.pricePerKm))}` 
                            : 'Not set - Edit to add'}
                        </small>
                      </div>
                    </div>
                  </Card.Body>

                  <div className="p-3 pt-0 d-flex gap-2" style={{ height: '60px', alignItems: 'center' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-fill"
                      onClick={() => handleEdit(vehicle)}
                      style={{ fontSize: '11px' }}
                    >
                      <PencilSquare className="me-1" size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="flex-fill"
                      onClick={() => handleRemove(vehicle._id)}
                      style={{ fontSize: '11px' }}
                    >
                      <Trash className="me-1" size={14} />
                      Remove
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Edit Modal */}
        <Modal 
          show={showModal} 
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="border-bottom">
            <Modal.Title className="d-flex align-items-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ 
                  backgroundColor: '#1976d2',
                  width: '40px',
                  height: '40px',
                  color: 'white'
                }}
              >
                <PencilSquare size={20} />
              </div>
              <span className="text-primary fw-bold">Edit Vehicle</span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="pt-4">
            {saveError && (
              <Alert variant="danger" className="mb-4">
                {saveError}
              </Alert>
            )}

            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Vehicle Type</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicleType"
                    value={editFields.vehicleType}
                    onChange={handleFieldChange}
                    placeholder="Enter vehicle type"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>License Plate</Form.Label>
                  <Form.Control
                    type="text"
                    name="licensePlate"
                    value={editFields.licensePlate}
                    onChange={handleFieldChange}
                    placeholder="Enter license plate"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Load Capacity</Form.Label>
                  <Form.Control
                    type="text"
                    name="loadCapacity"
                    value={editFields.loadCapacity}
                    onChange={handleFieldChange}
                    placeholder="Enter load capacity"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Price per KM (LKR)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="pricePerKm"
                    value={editFields.pricePerKm}
                    onChange={handleFieldChange}
                    placeholder="Enter price per kilometer"
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-bold mb-2">Change Image (optional)</Form.Label>
                  <Form.Control
                    type="file"
                    name="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFieldChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-top pt-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowModal(false)} 
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleSave} 
              disabled={isSaving}
              className="d-flex align-items-center"
            >
              {isSaving && <Spinner animation="border" size="sm" className="me-2" />}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
