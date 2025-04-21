import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            try {
                return JSON.parse(userInfo);
            } catch (error) {
                localStorage.removeItem("userInfo");
                return null;
            }
        }
        return null;
    });
    const [selectedChat, setSelectedChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState({});
    const navigate = useNavigate();

    const fetchChats = async () => {
        if (!user?.token) return;
        
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('/api/chat', config);
            setChats(data || []);
        } catch (error) {
            console.error('Error fetching chats:', error);
            setChats([]);
        } finally {
            setLoading(false);
        }
    };

    const markMessageAsRead = (chatId) => {
        setUnreadMessages(prev => {
            const newUnread = { ...prev };
            delete newUnread[chatId];
            return newUnread;
        });
    };

    const updateChat = (updatedChat) => {
        setChats(prevChats => {
            // Remove the chat from its current position
            const filteredChats = prevChats.filter(chat => chat._id !== updatedChat._id);
            
            // If this is a new message from another user and the chat is not selected
            if (updatedChat.latestMessage?.sender?._id !== user._id && 
                selectedChat?._id !== updatedChat._id) {
                setUnreadMessages(prev => ({
                    ...prev,
                    [updatedChat._id]: (prev[updatedChat._id] || 0) + 1
                }));
            }
            
            // Add the updated chat at the beginning of the array
            return [updatedChat, ...filteredChats];
        });
        
        if (selectedChat?._id === updatedChat._id) {
            setSelectedChat(updatedChat);
            markMessageAsRead(updatedChat._id);
        }
    };

    // Initialize socket connection
    useEffect(() => {
        if (!user) return;

        const socket = io();
        socket.emit("setup", user);
        socket.on("connected", () => {
            console.log("Socket connected");
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [user]);

    // Handle socket events
    useEffect(() => {
        if (!socket || !user) return;

        const handleNewMessage = (newMessage) => {
            if (!newMessage || !newMessage.chat) return;
            updateChat(newMessage.chat);
        };

        socket.on('message received', handleNewMessage);

        return () => {
            if (socket) {
                socket.off('message received', handleNewMessage);
            }
        };
    }, [user, selectedChat]);

    // Handle user changes
    useEffect(() => {
        if (user) {
            if (window.location.pathname === '/') {
                navigate("/chats");
            }
        } else {
            setChats([]);
            setSelectedChat(null);
            setUnreadMessages({});
            if (window.location.pathname !== '/') {
                navigate("/");
            }
        }
    }, [user, navigate]);

    // Separate useEffect for fetching chats
    useEffect(() => {
        if (user) {
            fetchChats();
        }
    }, [user]);

    return (
        <ChatContext.Provider 
            value={{
                user, 
                setUser,
                selectedChat,
                setSelectedChat,
                chats,
                setChats,
                loading,
                updateChat,
                fetchChats,
                unreadMessages,
                markMessageAsRead
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => useContext(ChatContext);

export default ChatProvider;
