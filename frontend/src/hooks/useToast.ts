import { create } from 'zustand';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

interface ToastStore {
    toasts: ToastMessage[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
    clearAll: () => set({ toasts: [] }),
}));

export const useToast = () => {
    const { addToast } = useToastStore();

    return {
        success: (message: string, duration?: number) =>
            addToast({ message, type: 'success', duration }),
        error: (message: string, duration?: number) =>
            addToast({ message, type: 'error', duration }),
        warning: (message: string, duration?: number) =>
            addToast({ message, type: 'warning', duration }),
        info: (message: string, duration?: number) =>
            addToast({ message, type: 'info', duration }),
    };
};
