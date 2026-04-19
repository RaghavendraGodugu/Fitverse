import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';

export default function FloatingButton() {
  const { toggleChat, isOpen } = useChatStore();

  return (
    <div className="fixed z-50 bottom-[calc(5rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] lg:bottom-8 lg:right-8">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="bg-[#141414]/90 backdrop-blur-md text-xs font-semibold py-1.5 px-3.5 rounded-full border border-white/10 text-zinc-300 shadow-xl whitespace-nowrap">
              AI Personal Trainer
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleChat}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_45px_rgba(59,130,246,0.6)] transition-all cursor-pointer border border-brand-300/30 relative"
            >
              <Bot className="text-dark-900 w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#141414]" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
