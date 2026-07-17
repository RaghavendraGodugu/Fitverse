import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiUrl } from '../lib/api';
import { useProfileStore } from './useProfileStore';

const defaultMessages = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hi! I'm Fitverse Coach powered by Gemini. Ask about workouts, form, nutrition, or recovery — I'll give personalized advice based on your profile.",
    timestamp: Date.now(),
  },
];

function getProfilePayload() {
  const { age, height, weight, goal, level, gender, diet } = useProfileStore.getState();
  return { age, height, weight, goal, level, gender, diet };
}

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
            body: JSON.stringify({
              query: content,
              mode: 'coaching',
              userProfile: getProfilePayload(),
            }),
          });

          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            const detail = json.detail;
            const errorMessage =
              (typeof detail === 'object' && detail?.error) ||
              (typeof detail === 'string' ? detail : null) ||
              json.error ||
              'Could not reach the AI coach. Ensure the backend is running and GEMINI_API_KEY is set in backend/.env.';

            addMessage({ role: 'assistant', content: errorMessage });
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
              'Could not reach the API. From the Fitness_App folder run `npm run dev` so both Vite and the backend start.',
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
