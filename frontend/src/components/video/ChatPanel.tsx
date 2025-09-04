// src/components/video/ChatPanel.tsx
'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChatMessage } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const ChatPanel: FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-80 bg-slate-800/95 backdrop-blur-sm border-l border-slate-600 z-20 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-600">
            <h3 className="text-lg font-semibold text-white">Chat</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${
                    msg.userId === 'system' 
                      ? 'text-center text-slate-400 text-sm py-2' 
                      : ''
                  }`}
                >
                  {msg.userId === 'system' ? (
                    <div className="bg-slate-700/50 rounded-lg px-3 py-1 text-xs">
                      {msg.message}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">
                          {msg.username}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      <div className="bg-slate-700 rounded-lg px-3 py-2 text-slate-100">
                        {msg.message}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-600">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                maxLength={500}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!message.trim()}
                className="px-3"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;