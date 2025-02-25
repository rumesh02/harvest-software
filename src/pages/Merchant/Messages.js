import React from "react";
import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Button } from "@mui/material";

const messages = [
  { id: 1, name: "Nimal Silva", unread: 2, image: "https://source.unsplash.com/50x50/?man", status: "online" },
  { id: 2, name: "Arjuna Perera", unread: 0, image: "https://source.unsplash.com/50x50/?person", status: "offline" },
  { id: 3, name: "Ajith Bandara", unread: 5, image: "https://source.unsplash.com/50x50/?businessman", status: "online" },
  { id: 4, name: "Supun Silva", unread: 3, image: "https://source.unsplash.com/50x50/?male", status: "online" },
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
