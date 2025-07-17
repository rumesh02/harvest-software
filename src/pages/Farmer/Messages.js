import React from "react";
import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button } from "@mui/material";

const messages = [
  { id: 1, name: "Green Valley Merchants", unread: 1, image: "https://source.unsplash.com/50x50/?store", status: "online" },
  { id: 2, name: "Fresh Market Co.", unread: 0, image: "https://source.unsplash.com/50x50/?market", status: "offline" },
  { id: 3, name: "City Wholesale", unread: 3, image: "https://source.unsplash.com/50x50/?business", status: "online" },
  { id: 4, name: "Farm Direct Buyers", unread: 0, image: "https://source.unsplash.com/50x50/?office", status: "online" },
];

const Messages = () => {
  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>Messages</Typography>
      
      <List>
        {messages.map((msg) => (
          <ListItem key={msg.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd", padding: "10px 0" }}>
            
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ListItemAvatar>
                <Avatar src={msg.image} />
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Typography variant="body1" fontWeight="bold">
                    {msg.name} 
                    <span style={{ marginLeft: 8, color: msg.status === "online" ? "green" : "red", fontSize: "10px" }}>●</span>
                  </Typography>
                }
                secondary={
                  msg.unread > 0 ? (
                    <Typography sx={{ color: "green", fontWeight: "bold" }}>
                      {msg.unread} unread messages
                    </Typography>
                  ) : (
                    <Typography sx={{ color: "gray" }}>No new messages</Typography>
                  )
                }
              />
            </Box>

            <Button variant="text" color="error">
              Delete Chat
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Messages;
