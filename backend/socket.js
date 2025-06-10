const Message = require('./models/Message');

module.exports = (io) => {
  const users = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      users[userId] = socket.id;
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
      // Save message to DB
      const msg = new Message({ senderId, receiverId, message });
      await msg.save();

      const receiverSocket = users[receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit('receiveMessage', { senderId, message });
      }
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
