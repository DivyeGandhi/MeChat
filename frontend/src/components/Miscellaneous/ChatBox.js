import React, { useState, useEffect } from 'react';
import { ChatState } from '../../context/ChatProvider';
import { io } from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";
var socket,selectedChatCompare;

useEffect(() => {
    console.log("Attempting to connect to socket.io...");
    socket = io(ENDPOINT, {
        transports: ['websocket'],
        upgrade: false
    });
    socket.on("connected", () => {
        console.log("Socket.io connected successfully!");
        console.log("Socket ID:", socket.id);
    });
    socket.on("error", (error) => {
        console.error("Socket connection error:", error);
    });
    socket.on("disconnected", (reason) => {
        console.log("Socket disconnected:", reason);
    });
}, []);

const ChatBox = ({ onSelectChat }) => {
    const { user, chats, setSelectedChat, setChats } = ChatState();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        if (onSelectChat) {
            onSelectChat(chat);
        }
        // Mark messages as read when selecting a chat
        markMessageAsRead(chat._id);
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim() === '') {
            setShowSearchResults(false);
            setSearchResults([]);
            return;
        }

        // Simulate search results
        const results = chats.filter(chat => 
            chat.chatName.toLowerCase().includes(query.toLowerCase()) ||
            chat.latestMessage.content.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(results);
        setShowSearchResults(true);
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        // Add new message handler
        socket.on("message received", (newMessage) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessage.chat._id) {
                // Update the chat list with the new message
                setChats((prevChats) => {
                    return prevChats.map((chat) => {
                        if (chat._id === newMessage.chat._id) {
                            return {
                                ...chat,
                                latestMessage: newMessage,
                                unreadCount: {
                                    ...chat.unreadCount,
                                    [user._id]: (chat.unreadCount?.[user._id] || 0) + 1
                                }
                            };
                        }
                        return chat;
                    });
                });
            }
        });

        return () => {
            socket.off("message received");
            socket.off("typing");
            socket.off("stop typing");
        };
    }, [user, selectedChatCompare, setChats]);

    useEffect(() => {
        console.log("User setup completed with socket.io");
    }, []);

    useEffect(() => {
        console.log("Cleaning up socket connection...");
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 theme-high-contrast:border-white">
                <h2 className="text-xl font-semibold text-black dark:text-white theme-high-contrast:text-white mb-4">
                    My Chats
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full border border-gray-300 dark:border-gray-600 theme-high-contrast:border-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 dark:focus:border-purple-500 theme-high-contrast:focus:border-yellow-500 bg-white dark:bg-gray-700 theme-high-contrast:bg-black text-black dark:text-white theme-high-contrast:text-white placeholder-gray-500 dark:placeholder-gray-400 theme-high-contrast:placeholder-gray-400"
                    />
                    <svg
                        className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2">
                {showSearchResults ? (
                    <div className="space-y-2">
                        {searchResults.map((chat) => (
                            <div 
                                key={chat._id}
                                onClick={() => handleChatSelect(chat)}
                                className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                                    selectedChatCompare?._id === chat._id ? 'bg-gray-100 dark:bg-gray-700' : ''
                                }`}
                            >
                                {/* Chat Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 theme-high-contrast:border-white">
                                        {chat.isGroupChat ? (
                                            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 theme-high-contrast:bg-gray-800 flex items-center justify-center">
                                                <span className="text-xl text-gray-600 dark:text-gray-300 theme-high-contrast:text-white">
                                                    {chat.chatName.charAt(0)}
                                                </span>
                                            </div>
                                        ) : (
                                            <img
                                                src={chat.users.find(u => u._id !== user._id)?.pic || ''}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    {!chat.isGroupChat && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 theme-high-contrast:border-black"></div>
                                    )}
                                </div>

                                {/* Chat Info */}
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white theme-high-contrast:text-white">
                                            {chat.isGroupChat ? chat.chatName : chat.users.find(u => u._id !== user._id)?.name}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 theme-high-contrast:text-gray-300">
                                            {chat.latestMessage?.createdAt 
                                                ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })
                                                : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 theme-high-contrast:text-gray-300 truncate">
                                            {chat.latestMessage?.content || 'No messages yet'}
                                        </p>
                                        {chat.unreadCount?.get(user._id) > 0 && (
                                            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                {chat.unreadCount.get(user._id)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {searchResults.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 theme-high-contrast:text-gray-400 py-4">
                                No results found
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chats?.map((chat) => (
                            <div 
                                key={chat._id}
                                onClick={() => handleChatSelect(chat)}
                                className={`flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                                    selectedChatCompare?._id === chat._id ? 'bg-gray-100 dark:bg-gray-700' : ''
                                }`}
                            >
                                {/* Chat Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 theme-high-contrast:border-white">
                                        {chat.isGroupChat ? (
                                            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 theme-high-contrast:bg-gray-800 flex items-center justify-center">
                                                <span className="text-xl text-gray-600 dark:text-gray-300 theme-high-contrast:text-white">
                                                    {chat.chatName.charAt(0)}
                                                </span>
                                            </div>
                                        ) : (
                                            <img
                                                src={chat.users.find(u => u._id !== user._id)?.pic || ''}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    {!chat.isGroupChat && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 theme-high-contrast:border-black"></div>
                                    )}
                                </div>

                                {/* Chat Info */}
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white theme-high-contrast:text-white">
                                            {chat.isGroupChat ? chat.chatName : chat.users.find(u => u._id !== user._id)?.name}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 theme-high-contrast:text-gray-300">
                                            {chat.latestMessage?.createdAt 
                                                ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })
                                                : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 theme-high-contrast:text-gray-300 truncate">
                                            {chat.latestMessage?.content || 'No messages yet'}
                                        </p>
                                        {chat.unreadCount?.get(user._id) > 0 && (
                                            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                {chat.unreadCount.get(user._id)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatBox;
