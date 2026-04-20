import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiUrl } from '../lib/api';

const defaultMessages = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hi! I'm Fitverse Coach. Ask about workouts, form, nutrition, or recovery — I'll use your question to give concise, practical advice.",
    timestamp: Date.now(),
  },
];

export const useChatStore = create(
  persist(
    (set, get) => ({
      isOpen: false,
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      closeChat: () => set({ isOpen: false }),
      openChat: () => set({ isOpen: true }),

      messages: defaultMessages,
      isTyping: false,

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Date.now().toString(),
              timestamp: Date.now(),
            },
          ],
        })),

      setTyping: (status) => set({ isTyping: status }),

      sendMessage: async (content) => {
        const trimmed = content?.trim();
        if (!trimmed) return;

        const { addMessage, setTyping } = get();

        addMessage({ role: 'user', content: trimmed });
        setTyping(true);

        try {
          const res = await fetch(apiUrl('/api/ai/chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: trimmed }),
          });

          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            addMessage({
              role: 'assistant',
              content:
                json?.error ||
                'Could not reach the API. Please try again in a moment.',
            });
            return;
          }

          if (json?.success && json?.data) {
            const { advice, reason, actionPlan } = json.data;
            let replyText = advice || 'I got your message, but no advice was returned.';

            if (reason) {
              replyText += `\n\n*Reason*: ${reason}`;
            }

            if (Array.isArray(actionPlan) && actionPlan.length > 0) {
              replyText += `\n\n*Action Plan*:\n• ${actionPlan.join('\n• ')}`;
            }

            addMessage({ role: 'assistant', content: replyText });
          } else {
            addMessage({
              role: 'assistant',
              content: json?.error || 'I received an invalid format from my servers.',
            });
          }
        } catch (error) {
          console.error('Chat API error:', error);
          addMessage({
            role: 'assistant',
            content: 'Could not reach the API. Please try again in a moment.',
          });
        } finally {
          setTyping(false);
        }
      },

      clearMessages: () => set({ messages: defaultMessages }),
    }),
    {
      name: 'fitverse-coach-chat',
      partialize: (state) => ({ messages: state.messages }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted || {}),
        isOpen: false,
        isTyping: false,
        messages:
          Array.isArray(persisted?.messages) && persisted.messages.length > 0
            ? persisted.messages
            : current.messages,
      }),
    }
  )
);
