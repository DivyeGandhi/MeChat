import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import PropTypes from 'prop-types';
import { ChatState } from '../context/ChatProvider';

const MyChats = ({ onMenuClick, selectedChat, onSelectChat, refresh }) => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const { chats, loading, fetchChats, user, unreadMessages, markMessageAsRead } = ChatState();

    const handleChatSelect = (chat) => {
        if (!chat || !chat._id) return;
        
        onSelectChat(chat);
        markMessageAsRead(chat._id);
    };

    // Filter chats based on search query
    const filteredChats = (chats || []).filter(chat => {
        const searchTerm = searchQuery.toLowerCase();
        if (chat.isGroupChat) {
            return chat.chatName.toLowerCase().includes(searchTerm);
        } else {
            return chat.users.some(u => u.name.toLowerCase().includes(searchTerm));
        }
    });

    const formatMessageTime = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const now = new Date();
            const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            if (diffInDays === 0) {
                // Today - show time
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            } else if (diffInDays === 1) {
                // Yesterday
                return 'Yesterday';
            } else if (diffInDays < 7) {
                // Within a week - show day name
                return date.toLocaleDateString([], { weekday: 'short' });
            } else {
                // Older than a week - show date
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Chats</h2>
                </div>
                <div className="mt-4 relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full p-3 pl-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                    />
                    <svg
                        className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                        <div
                            key={chat._id}
                            onClick={() => handleChatSelect(chat)}
                            className={`flex items-center p-3 cursor-pointer transition-all duration-200 ${
                                selectedChat?._id === chat._id
                                    ? "bg-blue-100 dark:bg-blue-900"
                                    : unreadMessages[chat._id]
                                    ? "bg-green-100 dark:bg-green-900"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            <div 
                                className="avatar mr-3"
                                data-letter={chat.isGroupChat 
                                    ? chat.chatName.charAt(0).toUpperCase() 
                                    : chat.users.find(u => u._id !== user._id)?.name.charAt(0).toUpperCase()}
                                data-group={chat.isGroupChat}
                            >
                                <span>
                                    {chat.isGroupChat
                                        ? chat.chatName.charAt(0).toUpperCase()
                                        : chat.users.find(
                                            (u) => u._id !== user._id
                                        )?.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium truncate">
                                        {!chat.isGroupChat
                                            ? chat.users.find(
                                                (u) => u._id !== user._id
                                            )?.name
                                            : chat.chatName}
                                    </h4>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 whitespace-nowrap">
                                        {formatMessageTime(chat.latestMessage?.createdAt || chat.updatedAt)}
                                    </span>
                                </div>
                                {chat.latestMessage ? (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {chat.latestMessage?.sender?._id === user._id 
                                                ? `You: ${chat.latestMessage.content}`
                                                : chat.latestMessage.content}
                                        </p>
                                        {unreadMessages[chat._id] && (
                                            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        No messages yet
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                        No chats found
                    </div>
                )}
            </div>
        </div>
    );
};

MyChats.propTypes = {
    onMenuClick: PropTypes.func,
    selectedChat: PropTypes.object,
    onSelectChat: PropTypes.func,
    refresh: PropTypes.bool
};

export default MyChats; 