const asyncHandler = require('express-async-handler');
const Message = require('../Models/messageModel');
const User = require('../Models/userModel');
const Chat = require('../Models/chatModel');

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try { 
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name email",
        });

        // Update the chat's latest message
        const chat = await Chat.findByIdAndUpdate(
            chatId,
            { 
                latestMessage: message,
                updatedAt: message.createdAt // Update the chat's timestamp to match the message
            },
            { new: true }
        );

        // Get all user IDs except the sender
        const recipientIds = chat.users
            .filter(user => user._id.toString() !== req.user._id.toString())
            .map(user => user._id.toString());

        // Increment unread count for all recipients at once
        if (recipientIds.length > 0) {
            await chat.incrementUnreadCount(recipientIds);
        }

        res.json(message);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(400);
        throw new Error(error.message);
    }
});

const allMessages = asyncHandler(async (req, res) => { 
    // console.log("allMessages", req.params.chatId);
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name email")
            .populate({
                path: "chat",
                populate: {
                    path: "users",
                    select: "name email"
                }
            })
            .sort({ createdAt: 1 }); // Sort messages by creation time

        if (!messages) {
            return res.status(404).json({ message: "No messages found" });
        }
        // console.log("messages", messages);

        // Mark messages as read when fetching
        const chat = await Chat.findById(req.params.chatId);
        if (chat) {
            await chat.resetUnreadCount(req.user._id.toString());
        }

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(400).json({ message: error.message });
    }
});

const markMessageAsRead = asyncHandler(async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.user._id;

        // Update all unread messages in this chat for this user
        await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            },
            {
                $addToSet: { readBy: userId }
            }
        );

        // Reset unread count for this user in this chat
        const chat = await Chat.findById(chatId);
        if (chat) {
            await chat.resetUnreadCount(userId.toString());
        }

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = { sendMessage, allMessages, markMessageAsRead };
