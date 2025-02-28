import React from "react";
import { Container, Grid, Card, CardContent, Typography, Avatar, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from "../components/Sidebar";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ["Dabulla", "Pettah", "Galle", "Peliyagoda", "Kalutara"],
  datasets: [
    {
      label: "Sales",
      data: [20, 35, 10, 22, 15],
      backgroundColor: "#6BCB77",
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Top Selling Districts" },
  },
  scales: {
    x: { beginAtZero: true },
    y: { beginAtZero: true },
  },
};

const topBuyers = [
  { name: "Nimal Silva", img: "/images/nimal.jpg" },
  { name: "Arjuna Perera", img: "/images/arjuna.jpg" },
  { name: "Ajith Bandara", img: "/images/ajith.jpg" },
  { name: "Supun Silva", img: "/images/supun.jpg" },
];

const Dashboard = () => {
  return (
    <Box sx={{ display: "flex", marginLeft: "-820px", marginTop: "30px" }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Dashboard
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3}>
          {[
            { title: "Revenue This Month", value: "Rs. 65,600" },
            { title: "Revenue This Year", value: "Rs. 425,300" },
            { title: "Total Orders", value: "27" },
          ].map((item, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card sx={{ background: "#E8F5E9" }}>
                <CardContent>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts & Top Buyers */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Top Districts
                </Typography>
                <Bar data={data} options={options} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Top Buyers
                </Typography>
                {topBuyers.map((buyer, index) => (
                  <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Avatar src={buyer.img} sx={{ width: 40, height: 40, mr: 2 }} />
                    <Typography>{buyer.name}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
