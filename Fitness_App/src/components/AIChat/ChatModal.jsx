import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { cn } from '../../lib/utils';

const suggestedReplies = [
  "Build a chest workout for today",
  "Explain proper deadlift form",
  "Why am I plateauing on bench?",
  "Suggest a post-workout meal"
];

export default function ChatModal() {
  const { isOpen, closeChat, messages, sendMessage, isTyping } = useChatStore();
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef(null);

  // Auto-scroll completely to bottom
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleSuggestedClick = (text) => {
    if (isTyping) return;
    sendMessage(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed z-50 flex flex-col overflow-hidden ring-1 ring-brand-500/20 bg-[#141414]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl inset-x-3 top-16 bottom-[calc(5rem+env(safe-area-inset-bottom))] max-h-[min(85dvh,calc(100dvh-6rem))] sm:inset-x-auto sm:top-auto sm:left-auto sm:right-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:w-[min(100vw-3rem,400px)] sm:h-[min(600px,75dvh)] sm:max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-900/40 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                <Bot className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  AI Personal Trainer <Sparkles className="w-3 h-3 text-brand-400" />
                </h3>
                <p className="text-xs text-brand-400 font-medium tracking-wide">AI ACTIVE</p>
              </div>
            </div>
            <button 
              onClick={closeChat}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
                  msg.role === 'user' ? "bg-zinc-800 border-zinc-700" : "bg-brand-500/20 border-brand-500/30"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-300" /> : <Bot className="w-4 h-4 text-brand-400" />}
                </div>
                <div className={cn(
                  "py-2.5 px-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-brand-600 text-white rounded-tr-sm" 
                    : "bg-white/10 text-zinc-100 rounded-tl-sm border border-white/5"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[85%]"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-brand-400" />
                </div>
                <div className="py-3 px-4 rounded-2xl bg-white/5 rounded-tl-sm border border-white/5 flex items-center gap-1.5">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-brand-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-brand-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-brand-400 rounded-full" />
                </div>
              </motion.div>
            )}
            <div ref={endOfMessagesRef} className="h-1 pb-4" />
          </div>

          {/* Suggested Prompts (disappears if typing or messages > 1 to save space, but lets keep it visible always if scrolled) */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
              {suggestedReplies.map((reply, i) => (
                <button 
                  key={i}
                  onClick={() => handleSuggestedClick(reply)}
                  className="text-xs px-3 py-1.5 rounded-full border border-brand-500/30 text-brand-300 hover:bg-brand-500/10 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-dark-900 border-t border-white/5">
            <form onSubmit={handleSubmit} className="flex gap-2 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your coach anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 flex-shrink-0 bg-brand-500 rounded-xl flex items-center justify-center text-dark-900 hover:bg-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 -ml-0.5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
