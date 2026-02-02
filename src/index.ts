import express from 'express';
import http from 'http';
import { setupSocketIO } from './socket';
import { Server as SocketIOServer } from 'socket.io';
import { userRouter } from './routes/user.route';
import { errorHandler } from './error_handler/error.handler';
import "./setup/db.setup";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*',
    },
});

// Socket.IO connection
setupSocketIO(io);

// Middleware
app.use(express.json());

app.use('/api/users', userRouter);
// Example REST API route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from API!' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});