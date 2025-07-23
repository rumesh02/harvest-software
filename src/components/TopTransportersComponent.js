import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const TopTransportersComponent = () => {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 5,
    status: 'all'
  });

  useEffect(() => {
    const fetchTopTransporters = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        params.append('limit', filters.limit);
        if (filters.status !== 'all') {
          params.append('status', filters.status);
        }
        
        const response = await api.get(`/drivers/top-transporters?${params.toString()}`);
        
        if (response.data.success) {
          setTransporters(response.data.data.topTransporters);
        } else {
          setError('Failed to fetch top transporters');
        }
      } catch (err) {
        console.error('Error fetching top transporters:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchTopTransporters();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="top-transporters-container">
        <h3>🏆 Top Transporters</h3>
        <div className="loading-state" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '2rem',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            border: '3px solid #f3f3f3', 
            borderTop: '3px solid #007BFF', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          <span style={{ marginLeft: '0.5rem', color: '#666' }}>Loading top transporters...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="top-transporters-container">
        <h3>🏆 Top Transporters</h3>
        <div className="error-state" style={{ 
          padding: '2rem',
          background: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: '8px',
          color: '#c53030'
        }}>
          <p>❌ Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="top-transporters-container" style={{ padding: '1rem' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .transporter-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,123,255,0.15);
          }
        `}
      </style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: '#333' }}>🏆 Top Transporters</h3>
        
        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={filters.limit} 
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.9rem'
            }}
          >
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
          
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      {transporters.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem 1rem', 
          color: '#666', 
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚛</div>
          <h4>No transporters found</h4>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {transporters.map((transporter, index) => (
            <div 
              key={transporter.transporterId} 
              className="transporter-card"
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: index < 3 ? `2px solid ${
                  index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32'
                }` : '1px solid #e0e0e0',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Rank Badge */}
              {index < 3 && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  #{index + 1}
                </div>
              )}
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <img
                  src={transporter.profilePicture || '/placeholder.svg'}
                  alt={transporter.name}
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    marginRight: '1rem',
                    border: '3px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#333', fontSize: '1.1rem' }}>
                    {transporter.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {transporter.rating > 0 && (
                      <span style={{ color: '#ffa500', fontSize: '0.9rem' }}>
                        ⭐ {transporter.rating.toFixed(1)}
                      </span>
                    )}
                    {transporter.isOnline && (
                      <span style={{ 
                        background: '#10b981', 
                        color: '#fff', 
                        padding: '2px 6px', 
                        borderRadius: '12px', 
                        fontSize: '0.7rem' 
                      }}>
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Statistics */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>Total Bookings:</span>
                  <strong style={{ color: '#007BFF', fontSize: '1.1rem' }}>
                    {transporter.bookingCount}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>Merchants Served:</span>
                  <strong style={{ color: '#28a745' }}>
                    {transporter.merchantCount}
                  </strong>
                </div>
                {transporter.vehicleType && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Vehicle:</span>
                    <span style={{ color: '#333', fontWeight: '500' }}>
                      {transporter.vehicleType}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Contact Info */}
              {transporter.phone && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: '#f8f9fa', 
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Contact:</div>
                  <div style={{ fontSize: '0.9rem', color: '#333' }}>📱 {transporter.phone}</div>
                  {transporter.email && (
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                      ✉️ {transporter.email}
                    </div>
                  )}
                </div>
              )}
              
              {/* Status Breakdown */}
              {transporter.statusCounts && (
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <div style={{ marginBottom: '0.25rem' }}>Status Breakdown:</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Object.entries(transporter.statusCounts).map(([status, count]) => (
                      <span 
                        key={status}
                        style={{ 
                          background: status === 'completed' ? '#d4edda' : 
                                    status === 'pending' ? '#fff3cd' : 
                                    status === 'cancelled' ? '#f8d7da' : '#e2e3e5',
                          color: status === 'completed' ? '#155724' : 
                                status === 'pending' ? '#856404' : 
                                status === 'cancelled' ? '#721c24' : '#383d41',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem'
                        }}
                      >
                        {status}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopTransportersComponent;
