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
          messages: [...state.messages, { ...message, id: Date.now().toString(), timestamp: Date.now() }],
        })),

      setTyping: (status) => set({ isTyping: status }),

      sendMessage: async (content) => {
        const { addMessage, setTyping } = get();

        addMessage({ role: 'user', content });
        setTyping(true);

        try {
          const res = await fetch(apiUrl('/api/ai/chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: content }),
          });

          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            addMessage({
              role: 'assistant',
              content:
                json.error ||
                'Could not reach the API. From the Fitness_App folder run `npm run dev` so both Vite and the backend start, or run the backend with `cd backend && npm run dev` if you use Vite alone.',
            });
            return;
          }

          if (json.success && json.data) {
            const { advice, reason, actionPlan } = json.data;
            let replyText = advice;

            if (reason || actionPlan) {
              replyText += `\n\n*Reason*: ${reason || ''}`;
              if (actionPlan && actionPlan.length > 0) {
                replyText += `\n\n*Action Plan*:\n• ${actionPlan.join('\n• ')}`;
              }
            }
            addMessage({ role: 'assistant', content: replyText });
          } else {
            addMessage({ role: 'assistant', content: json.error || 'I received an invalid format from my servers.' });
          }
        } catch (error) {
          console.error(error);
          addMessage({
            role: 'assistant',
            content:
              'Could not reach the API. From the Fitness_App folder run `npm run dev` so both Vite and the backend start, or run the backend with `cd backend && npm run dev` if you use Vite alone.',
          });
        } finally {
          setTyping(false);
        }
      },
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
          persisted?.messages && Array.isArray(persisted.messages) && persisted.messages.length > 0
            ? persisted.messages
            : current.messages,
      }),
    }
  )
);
