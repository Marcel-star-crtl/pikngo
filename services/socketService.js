// services/socketService.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // Store user socket mappings
    }

    initialize(server) {
        this.io = socketIO(server, {
            cors: {
                // origin: process.env.CLIENT_URL || "*",
                origin: process.env.CLIENT_URL.split(',') || ["http://localhost:3000", "http://localhost:5000"],
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                next();
            } catch (error) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.userId}`);
            this.connectedUsers.set(socket.userId, socket.id);

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.userId}`);
                this.connectedUsers.delete(socket.userId);
            });

            // Join task room
            socket.on('join-task', (taskId) => {
                socket.join(`task-${taskId}`);
                console.log(`User ${socket.userId} joined task room: ${taskId}`);
            });

            // Leave task room
            socket.on('leave-task', (taskId) => {
                socket.leave(`task-${taskId}`);
                console.log(`User ${socket.userId} left task room: ${taskId}`);
            });
        });
    }

    // Emit event to specific user
    emitToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }

    // Emit event to task room
    emitToTask(taskId, event, data) {
        this.io.to(`task-${taskId}`).emit(event, data);
    }

    // Emit event to all connected users
    emitToAll(event, data) {
        this.io.emit(event, data);
    }
}

module.exports = new SocketService();