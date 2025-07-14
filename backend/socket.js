const Message = require('./models/Message');
const User = require('./models/User');

module.exports = (io) => {
  const users = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      users[userId] = socket.id;
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    socket.on('joinRoom', ({ senderId, receiverId }) => {
      const roomName = [senderId, receiverId].sort().join('-');
      socket.join(roomName);
      console.log(`User ${senderId} joined room ${roomName}`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, senderName }) => {
      try {
      // Save message to DB
      const msg = new Message({ senderId, receiverId, message });
      await msg.save();

        // Get sender details if not provided
        let senderDetails = senderName;
        if (!senderDetails) {
          const sender = await User.findOne({ auth0Id: senderId });
          senderDetails = sender?.name || 'Unknown User';
        }

        const messageData = {
          senderId,
          receiverId,
          message,
          timestamp: msg.timestamp,
          senderName: senderDetails
        };

        // Emit to the room
        const roomName = [senderId, receiverId].sort().join('-');
        io.to(roomName).emit('receiveMessage', messageData);

        // Also emit to individual receiver for notifications
      const receiverSocket = users[receiverId];
        if (receiverSocket && receiverSocket !== socket.id) {
          io.to(receiverSocket).emit('receiveMessage', messageData);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle bid acceptance notifications
    socket.on('bidAccepted', (data) => {
      const { merchantId, productId, updatedProduct } = data;
      
      // Notify the merchant who placed the bid
      const merchantSocket = users[merchantId];
      if (merchantSocket) {
        io.to(merchantSocket).emit('bidStatusUpdated', {
          type: 'accepted',
          productId,
          updatedProduct
        });
      }

      // Broadcast to all connected users about product quantity update
      io.emit('productQuantityUpdated', {
        productId,
        updatedProduct
      });
    });

    socket.on('disconnect', () => {
      for (let userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
        }
      }
    });
  });
};
