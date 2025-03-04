import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const Dashboard = ({
  monthlyRevenue = "Rs. 65,600",
  yearlyRevenue = "Rs. 425,300",
  totalOrders = 27,
  topDistricts = [
    { name: "Dabulla", value: 20 },
    { name: "Pettah", value: 35 },
    { name: "Galle", value: 10 },
    { name: "Ampara", value: 6 },
    { name: "Peliyagoda", value: 20 },
    { name: "Kalutara", value: 15 },
  ],
  topBuyers = [
    { name: "Nimal Silva", avatar: "./images/nimal.jpg" },
    { name: "Arjuna Perera", avatar: "./images/farmer.jpg" },
    { name: "Ajith Bandara", avatar: "./images/nimal.jpg" },
    { name: "Supun Silva", avatar: "./images/farmer.jpg" },
  ],
}) => {
  return (
    <div className="p-4 bg-white rounded">
      <h4 className="mb-4">Dashboard</h4>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#f1f8e9" }}>
            <h6 className="text-muted">Revenue This Month</h6>
            <h2 className="text-center my-3">{monthlyRevenue}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#f1f8e9" }}>
            <h6 className="text-muted">Revenue This Year</h6>
            <h2 className="text-center my-3">{yearlyRevenue}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 rounded" style={{ backgroundColor: "#f1f8e9" }}>
            <h6 className="text-muted">Total Orders</h6>
            <h2 className="text-center my-3">{totalOrders}</h2>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="row g-4">
        <div className="col-md-7">
          <div className="bg-white rounded h-100 d-flex flex-column">
            <h5 className="mb-3">Top Districts</h5>
            <div className="flex-grow-1">
              <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                <BarChart data={topDistricts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="p-3 rounded h-100" style={{ backgroundColor: "#f1f8e9" }}>
            <h5 className="mb-3">Top Buyers</h5>
            <ul className="list-unstyled">
              {topBuyers.map((buyer, index) => (
                <li
                  key={index}
                  className="d-flex align-items-center py-2"
                >
                  <img
                    src={buyer.avatar || "/placeholder.svg"}
                    alt={buyer.name}
                    className="rounded-circle me-3"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  />
                  <span>{buyer.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard