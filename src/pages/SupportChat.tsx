import { useEffect, useState, useRef } from 'react';
import { messageAPI } from '../lib/api';
import { MessageCircle, Send, User, UserCheck, UserCircle, Clock, Search } from 'lucide-react';
import io, { Socket } from 'socket.io-client';

interface Conversation {
  userId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatar?: string;
    therapist?: any;
    client?: any;
    assignedTherapist?: any;
  };
  lastMessage: string;
  lastMessageContent: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  receiverId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  content: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  createdAt: string;
  isRead: boolean;
}

export default function SupportChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    initializeSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    socket.on('new-message', (newMessage: Message) => {
      console.log('Received new message:', newMessage);
      
      // Check if message is for current conversation
      if (selectedConversation) {
        const isForCurrentConversation = 
          (newMessage.senderId._id === selectedConversation.userId || 
           newMessage.receiverId._id === selectedConversation.userId);
        
        if (isForCurrentConversation) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m._id === newMessage._id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          scrollToBottom();
        }
      } else {
        // If no conversation selected, check if this is a new conversation
        // and add it to the list
        const isFromUser = newMessage.senderId.role !== 'admin';
        if (isFromUser) {
          // Refresh conversations to show new message
          fetchConversations();
        }
      }
      
      // Always refresh conversations to update unread count and last message
      fetchConversations();
    });

    socket.on('message-sent', (newMessage: Message) => {
      // Handle message sent confirmation (for admin's own messages)
      if (selectedConversation) {
        const isForCurrentConversation = 
          (newMessage.senderId._id === selectedConversation.userId || 
           newMessage.receiverId._id === selectedConversation.userId);
        
        if (isForCurrentConversation) {
          setMessages(prev => {
            // Update message if it exists, otherwise add it
            const index = prev.findIndex(m => m._id === newMessage._id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = newMessage;
              return updated;
            }
            return [...prev, newMessage];
          });
        }
      }
      fetchConversations();
    });

    socketRef.current = socket;
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getSupportConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await messageAPI.getAdminConversation(userId);
      setMessages(response.data.data.messages || []);
      setSelectedConversation({
        userId,
        user: response.data.data.user,
        lastMessage: '',
        lastMessageContent: '',
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const response = await messageAPI.sendAdminReply(selectedConversation.userId, message);
      setMessage('');
      
      // Add sent message immediately to UI (optimistic update)
      if (response.data.data) {
        const sentMessage = response.data.data;
        setMessages(prev => {
          if (prev.some(m => m._id === sentMessage._id)) {
            return prev;
          }
          return [...prev, sentMessage];
        });
      }
      
      // Refresh messages and conversations
      await fetchMessages(selectedConversation.userId);
      await fetchConversations();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'therapist':
        return <UserCheck className="w-4 h-4" />;
      case 'client':
        return <UserCircle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      therapist: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations List */}
      <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Support Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchQuery ? 'No conversations found' : 'No support conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConversation?.userId === conv.userId;
              return (
                <button
                  key={conv.userId}
                  onClick={() => fetchMessages(conv.userId)}
                  className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.user.avatar ? (
                          <img src={conv.user.avatar} alt="" className="w-full h-full rounded-full" />
                        ) : (
                          <span className="text-indigo-600 font-medium text-sm">
                            {conv.user.firstName[0]}{conv.user.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {conv.user.firstName} {conv.user.lastName}
                          </p>
                          {getRoleIcon(conv.user.role)}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.user.email}</p>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.lastMessageContent && (
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessageContent}</p>
                  )}
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.lastMessage).toLocaleString()}
                    </p>
                  )}
                  <div className="mt-2 flex items-center space-x-2">
                    {getRoleBadge(conv.user.role)}
                    {conv.user.therapist && (
                      <span className="text-xs text-gray-500">
                        {conv.user.therapist.credentials || 'SLP'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    {selectedConversation.user.avatar ? (
                      <img
                        src={selectedConversation.user.avatar}
                        alt=""
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="text-indigo-600 font-medium">
                        {selectedConversation.user.firstName[0]}
                        {selectedConversation.user.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleBadge(selectedConversation.user.role)}
                      <span className="text-sm text-gray-500">{selectedConversation.user.email}</span>
                    </div>
                    {selectedConversation.user.therapist && (
                      <div className="mt-1 text-xs text-gray-500">
                        {selectedConversation.user.therapist.credentials || 'SLP'} • 
                        {selectedConversation.user.therapist.specializations?.slice(0, 2).join(', ')}
                      </div>
                    )}
                    {selectedConversation.user.client && selectedConversation.user.assignedTherapist && (
                      <div className="mt-1 text-xs text-gray-500">
                        Therapist: {selectedConversation.user.assignedTherapist.userId?.firstName}{' '}
                        {selectedConversation.user.assignedTherapist.userId?.lastName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages - WhatsApp Style */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-2">
                {messages.map((msg, index) => {
                  // Check if message is from admin (current user)
                  const isAdmin = msg.senderId.role === 'admin';
                  const isFromCurrentUser = isAdmin;
                  
                  // Check if previous message is from same sender (for grouping)
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showAvatar = !prevMessage || 
                    prevMessage.senderId._id !== msg.senderId._id ||
                    new Date(msg.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000; // 5 minutes
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar (only for received messages, on left) */}
                      {!isFromCurrentUser && (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mb-1">
                          {msg.senderId.avatar ? (
                            <img src={msg.senderId.avatar} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            <span className="text-indigo-600 font-medium text-xs">
                              {msg.senderId.firstName[0]}{msg.senderId.lastName[0]}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div className={`flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        {/* Sender name (only for received messages) */}
                        {!isFromCurrentUser && showAvatar && (
                          <p className="text-xs text-gray-600 mb-1 px-2">
                            {msg.senderId.firstName} {msg.senderId.lastName}
                          </p>
                        )}
                        
                        {/* Message content */}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isFromCurrentUser
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          
                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((attachment, idx) => (
                                <a
                                  key={idx}
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center space-x-2 px-2 py-1 rounded text-xs ${
                                    isFromCurrentUser
                                      ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                                      : 'bg-gray-100 hover:bg-gray-200'
                                  }`}
                                >
                                  <span className="truncate">{attachment.fileName}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <p className={`text-xs mt-1 px-2 ${isFromCurrentUser ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      
                      {/* Avatar (only for sent messages, on right) */}
                      {isFromCurrentUser && (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mb-1">
                          <span className="text-white font-medium text-xs">A</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your reply..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
