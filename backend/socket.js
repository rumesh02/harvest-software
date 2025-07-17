const Message = require('./models/Message');
const User = require('./models/User');
const Notification = require('./models/Notification');

module.exports = (io) => {
  const users = {};
  const onlineUsers = new Set();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      users[userId] = socket.id;
      onlineUsers.add(userId);
      
      // Broadcast user online status
      socket.broadcast.emit('userOnline', { userId, online: true });
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    socket.on('joinRoom', ({ senderId, receiverId }) => {
      const roomName = [senderId, receiverId].sort().join('-');
      socket.join(roomName);
      console.log(`User ${senderId} joined room ${roomName}`);
    });

    // Handle typing indicators
    socket.on('typing', ({ senderId, receiverId, typing }) => {
      const roomName = [senderId, receiverId].sort().join('-');
      socket.to(roomName).emit('userTyping', { 
        userId: senderId, 
        typing 
      });
    });

    socket.on('sendMessage', async ({ 
      senderId, 
      receiverId, 
      message, 
      messageType = 'text',
      files = [],
      emojis = [],
      replyTo,
      senderName 
    }) => {
      try {
        // Save message to DB with enhanced data
        const msg = new Message({ 
          senderId, 
          receiverId, 
          message: message || '',
          messageType,
          files,
          emojis,
          replyTo
        });
        await msg.save();

        // Populate file details if any
        if (files.length > 0) {
          await msg.populate('files.fileId');
        }

        // Populate reply message if any
        if (replyTo) {
          await msg.populate('replyTo');
        }

        // Get sender details
        const sender = await User.findOne({ auth0Id: senderId });
        const senderDetails = {
          name: sender?.name || senderName || 'Unknown User',
          picture: sender?.picture || '',
          role: sender?.role || 'user'
        };

        const messageData = {
          senderId,
          receiverId,
          message: message || '',
          messageType,
          files,
          emojis,
          replyTo,
          timestamp: msg.timestamp,
          senderName: senderDetails.name,
          senderPicture: senderDetails.picture,
          senderRole: senderDetails.role,
          id: msg._id
        };

        // Emit to the room
        const roomName = [senderId, receiverId].sort().join('-');
        io.to(roomName).emit('receiveMessage', messageData);

        // Check if receiver is online
        const receiverSocket = users[receiverId];
        const isReceiverOnline = receiverSocket && receiverSocket !== socket.id;

        if (isReceiverOnline) {
          // Receiver is online, emit message directly
          io.to(receiverSocket).emit('receiveMessage', messageData);
        }

        // Create message preview for notification
        let messagePreview = '';
        if (messageType === 'file' && files.length > 0) {
          messagePreview = `📎 Sent ${files.length} file(s)`;
        } else if (messageType === 'emoji' && emojis.length > 0) {
          messagePreview = emojis.map(e => e.unicode).join(' ');
        } else if (messageType === 'mixed') {
          messagePreview = message || '📎 Mixed content';
        } else {
          messagePreview = message.length > 50 ? message.substring(0, 50) + '...' : message;
        }
        
        const notification = new Notification({
          userId: receiverId,
          title: `New message from ${senderDetails.name}`,
          message: messagePreview,
          type: 'message',
          relatedId: msg._id.toString(),
          metadata: {
            senderId: senderId,
            senderName: senderDetails.name,
            senderPicture: senderDetails.picture,
            senderRole: senderDetails.role,
            messagePreview: messagePreview,
            messageId: msg._id.toString(),
            messageType: messageType,
            hasFiles: files.length > 0,
            hasEmojis: emojis.length > 0
          }
        });

        await notification.save();

        // Emit notification to receiver if they're online
        if (isReceiverOnline) {
          io.to(receiverSocket).emit('newNotification', {
            userId: receiverId,
            notification: notification
          });
        }

        console.log(`Message sent from ${senderId} to ${receiverId}, notification created`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
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
      // Find and remove the disconnected user
      let disconnectedUserId = null;
      for (let userId in users) {
        if (users[userId] === socket.id) {
          disconnectedUserId = userId;
          delete users[userId];
          onlineUsers.delete(userId);
          break;
        }
      }
      
      // Broadcast user offline status
      if (disconnectedUserId) {
        socket.broadcast.emit('userOnline', { 
          userId: disconnectedUserId, 
          online: false,
          lastSeen: new Date()
        });
        console.log(`User ${disconnectedUserId} disconnected`);
      }
    });

    // Handle message delivery confirmation
    socket.on('messageDelivered', ({ messageId, userId }) => {
      const userSocket = users[userId];
      if (userSocket) {
        io.to(userSocket).emit('messageStatusUpdate', {
          messageId,
          status: 'delivered'
        });
      }
    });

    // Handle message read confirmation
    socket.on('messageRead', ({ messageId, userId }) => {
      const userSocket = users[userId];
      if (userSocket) {
        io.to(userSocket).emit('messageStatusUpdate', {
          messageId,
          status: 'read'
        });
      }
    });
  });
};
