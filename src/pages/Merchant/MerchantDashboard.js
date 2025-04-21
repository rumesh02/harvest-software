import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const MerchantDashboard = ({
  
  PendingPayments = "Rs. 425,300",
  ActiveBids =15,
  totalOrders = 27,
  monthlyData = [
    { name: "Jan", revenue: 50000 },
    { name: "Feb", revenue: 42000 },
    { name: "March", revenue: 65000 },
    { name: "April", revenue: 70000 },
    { name: "May", revenue: 62000 },
    { name: "June", revenue: 54000 },
    { name: "July", revenue: 68000 },
    { name: "Aug", revenue: 72000 },
    { name: "Sep", revenue: 58000 },
    { name: "Oct", revenue: 64000 },
    { name: "Nov", revenue: 75000 },
    { name: "Dec", revenue: 80000 },
  ],
  topFarmers = [
    { name: "Nimal Silva", avatar: "../images/nimal.jpg" },
    { name: "Arjuna Perera", avatar: "../images/farmer.jpg" },
    { name: "Ajith Bandara", avatar: "../images/nimal.jpg" },
    { name: "Supun Silva", avatar: "../images/farmer.jpg" },
  ],
}) => {
  return (
    <div className="p-4 bg-white rounded">
      <h4 className="mb-4">Dashboard</h4>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#FFEDD5" }}>
            <h6 className="text-muted">Total Orders</h6>
            <h2 className="text-center my-3">{totalOrders}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#FFEDD5" }}>
            <h6 className="text-muted">Active Bids</h6>
            <h2 className="text-center my-3">{ActiveBids}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#FFEDD5" }}>
            <h6 className="text-muted">Pending Payments</h6>
            <h2 className="text-center my-3">{PendingPayments}</h2>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="row g-4">
        <div className="col-md-7">
          <div className="bg-white rounded h-100 d-flex flex-column">
            <h5 className="mb-3">Monthly Harvest Purchases</h5>
            <div className="flex-grow-1">
              <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="revenue" fill="#FFEDD5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="p-3 rounded h-100" style={{ backgroundColor: "#FFEDD5" }}>
            <h5 className="mb-3">Top Farmers</h5>
            <ul className="list-unstyled">
              {topFarmers.map((Farmer, index) => (
                <li
                  key={index}
                  className="d-flex align-items-center py-2"
                >
                  <img
                    src={Farmer.avatar || "/placeholder.svg"}
                    alt={Farmer.name}
                    className="rounded-circle me-3"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                  <span>{ Farmer.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
