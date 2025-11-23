import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { BreadcrumbItem } from '../components/common/Breadcrumb';

interface AppState {

    // Current selections/context
    selectedMatchId: string | null;
    selectedMatchTitle: string | null;
    selectedPlayerId: string | null;

    // Breadcrumb state
    breadcrumbs: BreadcrumbItem[];

    // Actions
    setSelectedMatchId: (id: string | null) => void;
    setSelectedMatchTitle: (title: string | null) => void;
    setSelectedPlayerId: (id: string | null) => void;
    setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
    addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
    clearBreadcrumbs: () => void;

    // Reset functions
    reset: () => void;
}

const initialState = {
    selectedMatchId: null,
    selectedMatchTitle: null,
    selectedPlayerId: null,
    breadcrumbs: [] as BreadcrumbItem[],
};

export const useAppStore = create<AppState>()(
    devtools(
        (set) => ({
            ...initialState,

            setSelectedMatchId: (id) => set({ selectedMatchId: id }),
            setSelectedMatchTitle: (title) => set({ selectedMatchTitle: title }),
            setSelectedPlayerId: (id) => set({ selectedPlayerId: id }),
            setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
            addBreadcrumb: (breadcrumb) => set((state) => ({
                breadcrumbs: [...state.breadcrumbs, breadcrumb]
            })),
            clearBreadcrumbs: () => set({ breadcrumbs: [] }),

            reset: () => set(initialState),
        }),
        {
            name: 'easycoach-app-store',
        }
    )
);

// Selectors for better performance
export const useSelectedMatchId = () => useAppStore((state) => state.selectedMatchId);
export const useSelectedMatchTitle = () => useAppStore((state) => state.selectedMatchTitle);
export const useSelectedPlayerId = () => useAppStore((state) => state.selectedPlayerId);
export const useBreadcrumbs = () => useAppStore((state) => state.breadcrumbs);