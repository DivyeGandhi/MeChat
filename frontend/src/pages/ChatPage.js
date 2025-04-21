import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ChatState } from '../context/ChatProvider';
import ChatBox from '../components/ChatBox';
import MyChats from '../components/MyChats';
import SideDrawer from '../components/Miscellaneous/SideDrawer';
import { useHistory } from 'react-router-dom';

const ChatPage = () => {
    const { theme } = useTheme();
    const { selectedChat, setSelectedChat, loading, user, notification, setNotification } = ChatState();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [refreshChats, setRefreshChats] = useState(false);
    const drawerRef = useRef(null);
    const history = useHistory();

    // Redirect to home if not logged in
    useEffect(() => {
        if (!user) {
            history.push("/");
        }
    }, [user, history]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const handleClickOutside = (event) => {
        if (drawerRef.current && !drawerRef.current.contains(event.target)) {
            setIsDrawerOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        if (isMobileView) {
            setIsDrawerOpen(false);
        }
    };

    const handleBackToChats = () => {
        setSelectedChat(null);
    };

    const handleChatCreated = () => {
        setRefreshChats(prev => !prev);
    };

    // Show loading spinner while fetching data
    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Don't render anything if no user
    if (!user) {
        return null;
    }

    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-gray-900">
            {/* Sidebar Overlay */}
            <div
                ref={drawerRef}
                className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
                    isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                } z-[90]`}
            >
                <SideDrawer onClose={toggleDrawer} onChatSelect={handleChatSelect} onChatCreated={handleChatCreated} />
            </div>

            {/* Overlay Background */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[80]"
                    onClick={toggleDrawer}
                />
            )}

            {/* Main Content */}
            <div className="h-full flex">
                {/* Chat List - Always visible in desktop, conditionally visible in mobile */}
                <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
                    isMobileView && selectedChat ? '-translate-x-full' : 'translate-x-0'
                }`}>
                    <MyChats 
                        onMenuClick={toggleDrawer} 
                        selectedChat={selectedChat}
                        onSelectChat={handleChatSelect}
                        refresh={refreshChats}
                    />
                </div>

                {/* Chat Box - Only visible when chat is selected in mobile */}
                <div className={`${isMobileView ? 'fixed inset-0' : 'flex-1'} transform transition-transform duration-300 ease-in-out ${
                    isMobileView && !selectedChat ? 'hidden' : 'translate-x-0'
                }`}>
                    <ChatBox 
                        onBack={handleBackToChats}
                        isMobileView={isMobileView}
                        fetchAgain={refreshChats}
                        setFetchAgain={setRefreshChats}
                        notification={notification}
                        setNotification={setNotification}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
