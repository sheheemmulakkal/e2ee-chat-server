import { Server as SocketIOServer } from 'socket.io';

export const setupSocketIO = (io: SocketIOServer) => {
    io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('message', (data) => {
        console.log('Received message:', data);
        // Echo back the message
        socket.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
}