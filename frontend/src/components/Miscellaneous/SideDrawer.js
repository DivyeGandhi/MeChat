import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ChatState } from '../../context/ChatProvider';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const SideDrawer = ({ onClose, onChatCreated, onChatSelect }) => {
    const { theme, toggleTheme, THEME_MODES } = useTheme();
    const { user, setUser } = ChatState();
    const history = useHistory();
    const [showGeneralSettings, setShowGeneralSettings] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [chatSearchResults, setChatSearchResults] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const drawerRef = useRef(null);

    const getAuthToken = () => {
        const userInfoStr = localStorage.getItem('userInfo');
        if (!userInfoStr) {
            throw new Error('User not logged in');
        }
        const userInfo = JSON.parse(userInfoStr);
        if (!userInfo?.token) {
            throw new Error('Invalid user token');
        }
        return userInfo.token;
    };

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        setUser(null);
        history.push("/");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if any dialog is open
            const isDialogOpen = showGeneralSettings || showProfileDialog || showCreateGroup || showNewChat;
            
            // If a dialog is open, don't close the sidebar
            if (isDialogOpen) {
                return;
            }

            // Check if click is outside the drawer
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                // Add a small delay before calling onClose to allow the animation to complete
                setTimeout(() => {
                    onClose();
                }, 300);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, showGeneralSettings, showProfileDialog, showCreateGroup, showNewChat]);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            const token = getAuthToken();
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${query}`, config);
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const handleUserSelect = (user) => {
        if (!selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
    };

    const handleCreateGroup = async () => {
        if (groupName.trim() && selectedUsers.length > 0) {
            try {
                const token = getAuthToken();
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.post(
                    '/api/chat/group',
                    {
                        name: groupName,
                        users: JSON.stringify(selectedUsers.map(user => user._id))
                    },
                    config
                );

                setShowCreateGroup(false);
                setGroupName('');
                setSelectedUsers([]);
                
                // Refresh chat list and select the new group
                if (onChatCreated) {
                    onChatCreated();
                }
                if (onChatSelect) {
                    onChatSelect(data);
                }
                if (onClose) {
                    onClose();
                }
            } catch (error) {
                console.error('Error creating group:', error);
            }
        }
    };

    const handleAddToGroup = async (userId) => {
        if (!selectedGroup) return;

        try {
            const token = getAuthToken();
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.put(
                '/api/chat/groupadd',
                {
                    chatId: selectedGroup._id,
                    userId: userId
                },
                config
            );

            // Refresh chat list and update selected group
            if (onChatCreated) {
                onChatCreated();
            }
            if (onChatSelect) {
                onChatSelect(data);
            }
        } catch (error) {
            console.error('Error adding user to group:', error);
        }
    };

    const handleRemoveFromGroup = async (userId) => {
        if (!selectedGroup) return;

        try {
            const token = getAuthToken();
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.put(
                '/api/chat/groupremove',
                {
                    chatId: selectedGroup._id,
                    userId: userId
                },
                config
            );

            // Refresh chat list and update selected group
            if (onChatCreated) {
                onChatCreated();
            }
            if (onChatSelect) {
                onChatSelect(data);
            }
        } catch (error) {
            console.error('Error removing user from group:', error);
        }
    };

    const accessChat = async (userId) => {
        try {
            const token = getAuthToken();
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(`/api/chat/access?userId=${userId}`, config);
            setShowNewChat(false);
            setSearchQuery('');
            setSearchResults([]);
            
            // Call onChatCreated to refresh the chat list
            if (onChatCreated) {
                onChatCreated();
            }
            
            // Select the new chat
            if (onChatSelect) {
                onChatSelect(data);
            }
            
            // Close the drawer
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error('Error accessing chat:', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* User Profile Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center">
                    {/* Profile Picture */}
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 mb-4">
                        {user?.pic ? (
                            <img 
                                src={user.pic} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-3xl font-semibold text-blue-600 dark:text-blue-300">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* User Info */}
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {user?.name || 'User'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email || 'user@example.com'}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-3">
                <button
                    onClick={() => setShowNewChat(true)}
                    className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>New Chat</span>
                </button>

                <button
                    onClick={() => setShowCreateGroup(true)}
                    className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create New Group</span>
                </button>
            </div>

            {/* Settings Section */}
            <div className="flex-1 p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Settings
                </h3>
                <div className="space-y-2">
                    <button 
                        onClick={() => setShowGeneralSettings(true)}
                        className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>General Settings</span>
                    </button>

                    <button 
                        className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Privacy & Security</span>
                    </button>

                    <button 
                        className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span>Notifications</span>
                    </button>
                </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>

            {/* General Settings Dialog */}
            {showGeneralSettings && (
                <div className="fixed inset-0 bg-white dark:bg-gray-800 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setShowGeneralSettings(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                General Settings
                            </h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="max-w-md mx-auto space-y-8">
                            {/* Theme Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Theme
                                </h3>
                                <div className="space-y-2">
                                    {Object.values(THEME_MODES).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => toggleTheme(mode)}
                                            className={`w-full flex items-center p-4 rounded-lg border ${
                                                theme === mode
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            } transition-colors duration-200`}
                                        >
                                            <div className={`w-5 h-5 rounded-full mr-4 ${
                                                mode === THEME_MODES.LIGHT ? 'bg-gray-100 border-2 border-gray-300' :
                                                'bg-gray-900 border-2 border-gray-600'
                                            }`} />
                                            <div className="flex-1">
                                                <p className="text-base font-medium text-gray-900 dark:text-white">
                                                    {mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase()} Mode
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {mode === THEME_MODES.LIGHT ? 'Clean, bright interface for daytime use' :
                                                     'Easy on the eyes, perfect for night time'}
                                                </p>
                                            </div>
                                            {theme === mode && (
                                                <svg className="w-5 h-5 text-blue-500 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Other Settings Sections */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Notifications
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-base font-medium text-gray-900 dark:text-white">
                                                Message Notifications
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Get notified when you receive new messages
                                            </p>
                                        </div>
                                        <button className="w-11 h-6 rounded-full bg-blue-500 relative">
                                            <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Privacy
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div>
                                            <p className="text-base font-medium text-gray-900 dark:text-white">
                                                Read Receipts
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Let others know when you've read their messages
                                            </p>
                                        </div>
                                        <button className="w-11 h-6 rounded-full bg-gray-200 dark:bg-gray-700 relative">
                                            <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Dialog */}
            {showProfileDialog && (
                <div className="fixed inset-0 bg-white dark:bg-gray-800 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setShowProfileDialog(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Profile
                            </h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="max-w-md mx-auto space-y-8">
                            {/* Profile Picture */}
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 mb-4">
                                    {user?.pic ? (
                                        <img 
                                            src={user.pic} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <span className="text-4xl font-semibold text-blue-600 dark:text-blue-300">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button className="text-blue-500 dark:text-blue-400 font-medium">
                                    Change Photo
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Your email"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <button className="w-full p-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors duration-200">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Group Dialog */}
            {showCreateGroup && (
                <div className="fixed inset-0 bg-white dark:bg-gray-800 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setShowCreateGroup(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Create New Group
                            </h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="max-w-md mx-auto space-y-6">
                            {/* Group Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Enter group name"
                                />
                            </div>

                            {/* Search Users */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Add Members
                                </label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                                    placeholder="Search users..."
                                />
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="space-y-2">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user._id}
                                            onClick={() => handleUserSelect(user)}
                                            className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                                                    {user.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Selected Users */}
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full pl-3 pr-2 py-1"
                                        >
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {user.name}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveUser(user._id)}
                                                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Create Button */}
                            <button
                                onClick={handleCreateGroup}
                                disabled={!groupName || selectedUsers.length === 0}
                                className={`w-full p-3 rounded-lg font-medium ${
                                    !groupName || selectedUsers.length === 0
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                } transition-colors duration-200`}
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Chat Dialog */}
            {showNewChat && (
                <div className="fixed inset-0 bg-white dark:bg-gray-800 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => {
                                    setShowNewChat(false);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                New Chat
                            </h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="max-w-md mx-auto">
                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-full p-3 pl-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                                    placeholder="Search users..."
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

                            {/* Search Results */}
                            <div className="mt-4 space-y-2">
                                {searchResults.map((user) => (
                                    <button
                                        key={user._id}
                                        onClick={() => accessChat(user._id)}
                                        className="w-full p-3 flex items-center space-x-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                                                {user.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SideDrawer;
