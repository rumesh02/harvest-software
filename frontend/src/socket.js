import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend URL in production

// Socket event handlers for product updates
export const setupProductUpdateListeners = (updateCartItem, updateProductInList) => {
  // Listen for bid status updates
  socket.on('bidStatusUpdated', (data) => {
    console.log('Bid status updated:', data);
    if (data.type === 'accepted' && data.updatedProduct) {
      // Update the product in cart
      if (updateCartItem) {
        updateCartItem(data.productId, data.updatedProduct);
      }
      
      // Update the product in any product lists
      if (updateProductInList) {
        updateProductInList(data.productId, data.updatedProduct);
      }

      // Dispatch custom event for notifications
      window.dispatchEvent(new CustomEvent('bidAccepted', {
        detail: {
          type: 'bidAccepted',
          productId: data.productId,
          productName: data.updatedProduct.name,
          updatedProduct: data.updatedProduct
        }
      }));
    }
  });

  // Listen for product quantity updates
  socket.on('productQuantityUpdated', (data) => {
    console.log('Product quantity updated:', data);
    if (data.updatedProduct) {
      // Update the product in cart
      if (updateCartItem) {
        updateCartItem(data.productId, data.updatedProduct);
      }
      
      // Update the product in any product lists
      if (updateProductInList) {
        updateProductInList(data.productId, data.updatedProduct);
      }

      // Dispatch custom event for notifications
      window.dispatchEvent(new CustomEvent('productQuantityUpdated', {
        detail: {
          type: 'productQuantityUpdated',
          productId: data.productId,
          productName: data.updatedProduct.name,
          updatedProduct: data.updatedProduct
        }
      }));
    }
  });
};

// Function to join user to socket room
export const joinUserRoom = (userId) => {
  if (userId) {
    socket.emit('join', userId);
    console.log(`Joined socket room for user: ${userId}`);
  }
};

// Function to disconnect socket
export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;
