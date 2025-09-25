import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    editMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // track which message is being edited
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const handleEditClick = (message) => {
    setEditingMessageId(message._id);
    setEditingText(message.text);
  };

  const handleEditSave = async (messageId) => {
    if (editingText.trim() === "") return;
    await editMessage(messageId, editingText);
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isEditing = editingMessageId === message._id;

          return (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                  {message.isEdited && " (edited)"}
                </time>
              </div>

              <div className="chat-bubble flex flex-col relative group">
                {message.image && (
                  <div className="relative">
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                      onClick={() => window.open(message.image, "_blank")}
                    />
                    <a
                      href={message.image}
                      download={`chat-image-${message._id}.jpg`}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                      title="Download image"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                )}

                {isEditing ? (
                  <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      <span>Editing message</span>
                    </div>

                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                      rows="3"
                      placeholder="Type your message..."
                      autoFocus
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleEditCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(message._id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {message.text}
                  </p>
                )}

                {/* Edit & Delete buttons for sender */}
                {message.senderId === authUser._id && !isEditing && (
                  <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                    <button
                      onClick={() => handleEditClick(message)}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2.5 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border-2 border-white dark:border-gray-800"
                      title="Edit message"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border-2 border-white dark:border-gray-800"
                      title="Delete message"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
