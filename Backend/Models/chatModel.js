//chatName
//isGroupChatornot
//list of user
//reference to latest message
// group admin

const mongoose = require('mongoose');

const ChatModel = mongoose.Schema({
    chatName: { 
        type: String, 
        trim: true 
    },
    isGroupChat: { 
        type: Boolean, 
        default: false 
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true
});

// Add a method to update unread count
ChatModel.methods.incrementUnreadCount = async function(userIds) {
    try {
        // Convert userIds to array if it's a single ID
        const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
        
        // Update unread counts in memory first
        userIdArray.forEach(userId => {
            const currentCount = this.unreadCount.get(userId) || 0;
            this.unreadCount.set(userId, currentCount + 1);
        });

        // Save once with all updates
        await this.save();
    } catch (error) {
        console.error('Error incrementing unread count:', error);
        throw error;
    }
};

// Add a method to reset unread count
ChatModel.methods.resetUnreadCount = async function(userId) {
    try {
        if (this.unreadCount) {
            this.unreadCount.set(userId, 0);
            await this.save();
        }
    } catch (error) {
        console.error('Error resetting unread count:', error);
        throw error;
    }
};

module.exports = mongoose.model("Chat", ChatModel);