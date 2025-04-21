# MeChat - Real-time Chat Application

A full-stack real-time chat application built with MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for real-time communication.

## Features

- Real-time messaging
- User authentication
- Group chats
- One-on-one chats
- Dark/Light theme
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm

## Environment Setup

Create a `.env` file in the root directory with the following variables:
```
PORT=7000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## Installation and Build

1. Clone the repository:
```bash
git clone git@github.com:DivyeGandhi/MeChat.git
cd MeChat
```

2. Run the build command (this will install all dependencies and build the frontend):
```bash
npm run build
```
This command will:
- Install all backend dependencies
- Install all frontend dependencies
- Build the frontend for production

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm start
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:7000

### Production Mode

1. Start in production mode:
```bash
npm run start:prod
```

The application will be available at:
- http://localhost:7000 (serves both frontend and backend)

## Project Structure

```
MeChat/
├── Backend/
│   ├── Config/         # Database and JWT configuration
│   ├── Controllers/    # Route controllers
│   ├── Middleware/     # Custom middleware
│   ├── Models/         # Mongoose models
│   ├── Routes/         # API routes
│   └── server.js       # Main server file
├── frontend/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── config/     # Configuration files
│   │   ├── context/    # React context
│   │   └── pages/      # Page components
│   └── package.json
└── package.json
```

## API Endpoints

- POST /api/user/register - Register a new user
- POST /api/user/login - Login user
- GET /api/chat - Get all chats
- POST /api/chat - Create new chat
- GET /api/message/:chatId - Get messages for a chat
- POST /api/message - Send a new message

## Technologies Used

- Frontend:
  - React.js (v18.2.0)
  - Socket.io-client (v4.8.1)
  - React Router (v5.3.4)
  - React Toastify (v9.1.3)
  - Tailwind CSS
  - React Icons

- Backend:
  - Node.js
  - Express.js (v5.1.0)
  - Socket.io (v4.8.1)
  - MongoDB
  - Mongoose (v8.13.2)
  - JWT Authentication
  - Nodemon (v3.1.9)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 