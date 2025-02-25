import React from "react";
import { Box, Container, Typography } from "@mui/material";
import MerchantSidebar from "../components/MerchantSidebar";

const Dashboard = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <MerchantSidebar />
      <Container sx={{ mt: 4, ml: "260px" }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Welcome Back!
        </Typography>

        {/* Add Dashboard Content Here */}
      </Container>
    </Box>
  );
};

export default Dashboard;
