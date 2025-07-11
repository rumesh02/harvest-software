import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend URL in production

export default socket;
