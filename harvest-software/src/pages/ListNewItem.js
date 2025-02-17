import React from "react";
import Sidebar from "../components/Sidebar";
import { Button, TextField, MenuItem, Typography, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const harvestTypes = [
  "Vegetables",
  "Fruits",
  "Grains",
  "Dairy",
  "Meat",
  "Other",
];

const ListNewItem = () => {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          List New Item
        </Typography>
        <Typography variant="h6" gutterBottom>
          Add Your Harvest Here
        </Typography>

        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 600 }}
        >
          <TextField select label="Harvest Type" fullWidth>
            {harvestTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField label="Harvest Name" fullWidth />
          <TextField label="Minimum Bid Price" fullWidth InputProps={{ startAdornment: "Rs." }} />
          <TextField label="Available Weight of Stock" fullWidth InputProps={{ endAdornment: "Kg" }} />

          {/* Upload Box */}
          <Box
            sx={{
              border: "2px dashed #ccc",
              padding: 3,
              textAlign: "center",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            <CloudUploadIcon fontSize="large" />
            <Typography>Click to upload or drag and drop</Typography>
            <Typography variant="body2">JPG, JPEG, PNG less than 1MB</Typography>
          </Box>

          <Button variant="contained" color="success" fullWidth>
            Add Listing
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ListNewItem;
