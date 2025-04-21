const express = require('express');
const dotenv = require('dotenv');
const ConnectDB = require('./Config/db');
const userRoutes = require('./Routes/userRoutes');
const chatRoutes = require('./Routes/chatRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const { notFound, errorHandler } = require('./Middleware/errorMiddleware');
const cors = require('cors');
const Chat = require('./Models/chatModel');
const path = require('path');
dotenv.config();
ConnectDB();

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

//--------------------------------------------------DEPLOYMENT CODE-----------------------------------------------------------

const rootDir = path.resolve();

if (process.env.NODE_ENV === "production") {
    // Serve static files from the build directory
    app.use(express.static(path.join(rootDir, 'frontend', 'build')));
    
    // Handle all non-API routes
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(rootDir, 'frontend', 'build', 'index.html'));
    });
} else {
    // In development, just handle API routes
    app.get('/', (req, res) => {
        res.send("API is Running Successfully");
    });
}

//--------------------------------------------------DEPLOYMENT CODE ENDS-------------------------------------------------------

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 7000;

const server = app.listen(PORT, console.log(`Server Started on PORT ${PORT}`));

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    pingInterval: 30000,
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        if (!userData?._id) {
            console.log("Invalid user data for setup");
            return;
        }
        socket.join(userData._id);
        console.log("User Joined Personal Room:", userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        if (!room) {
            console.log("No room provided for join chat");
            return;
        }
        socket.join(room);
        console.log("User Joined Chat Room:", room);
    });

    socket.on("typing", (data) => {
        if (!data || !data.chatId || !data.userId) {
            console.log("Invalid typing data received");
            return;
        }
        console.log("Typing in room:", data.chatId, "by user:", data.userName);
        socket.to(data.chatId).emit("typing", {
            chatId: data.chatId,
            userId: data.userId,
            userName: data.userName
        });
    });

    socket.on("stop typing", (data) => {
        if (!data || !data.chatId || !data.userId) {
            console.log("Invalid stop typing data received");
            return;
        }
        console.log("Stopped typing in room:", data.chatId, "by user:", data.userName);
        socket.to(data.chatId).emit("stop typing", {
            chatId: data.chatId,
            userId: data.userId,
            userName: data.userName
        });
    });

    socket.on("new message", async (newMessageReceived) => {
        try {
            console.log("New message received:", newMessageReceived._id);
            
            if (!newMessageReceived?.chat?._id) {
                console.log("Invalid message data: missing chat ID");
                return;
            }

            // Update the chat's latest message
            const updatedChat = await Chat.findByIdAndUpdate(
                newMessageReceived.chat._id,
                { 
                    latestMessage: newMessageReceived,
                    updatedAt: new Date()
                },
                { 
                    new: true,
                    populate: {
                        path: 'users latestMessage',
                        select: 'name email'
                    }
                }
            );

            if (!updatedChat) {
                console.log("Chat not found:", newMessageReceived.chat._id);
                return;
            }

            // Emit to all users in the chat except the sender
            updatedChat.users.forEach((user) => {
                if (user._id.toString() === newMessageReceived.sender._id.toString()) {
                    console.log("Skipping sender:", user._id);
                    return;
                }

                console.log("Sending message to user:", user._id);
                // Emit to user's personal room
                socket.to(user._id.toString()).emit("message received", {
                    ...newMessageReceived,
                    chat: updatedChat
                });
            });

            // Also emit to the chat room
            console.log("Broadcasting to chat room:", updatedChat._id);
            socket.to(updatedChat._id.toString()).emit("message received", {
                ...newMessageReceived,
                chat: updatedChat
            });
        } catch (error) {
            console.error("Error handling new message:", error);
            // Emit error to sender
            socket.emit("error", { message: "Error processing message" });
        }
    });

    socket.on("leave chat", (room) => {
        if (!room) {
            console.log("No room provided for leave chat");
            return;
        }
        socket.leave(room);
        console.log("User Left Chat Room:", room);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});

// Handle server termination
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});