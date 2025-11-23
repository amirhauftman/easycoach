import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { BreadcrumbItem } from '../components/common/Breadcrumb';

interface AppState {
    // UI State
    sidebarOpen: boolean;
    theme: 'light' | 'dark';

    // User preferences
    preferredVideoQuality: 'auto' | 'high' | 'medium' | 'low';

    // Current selections/context
    selectedMatchId: string | null;
    selectedMatchTitle: string | null;
    selectedPlayerId: string | null;

    // Breadcrumb state
    breadcrumbs: BreadcrumbItem[];

    // Actions
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setPreferredVideoQuality: (quality: 'auto' | 'high' | 'medium' | 'low') => void;
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
    sidebarOpen: false,
    theme: 'light' as const,
    preferredVideoQuality: 'auto' as const,
    selectedMatchId: null,
    selectedMatchTitle: null,
    selectedPlayerId: null,
    breadcrumbs: [] as BreadcrumbItem[],
};

export const useAppStore = create<AppState>()(
    devtools(
        (set) => ({
            ...initialState,

            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            setTheme: (theme) => set({ theme }),
            setPreferredVideoQuality: (quality) => set({ preferredVideoQuality: quality }),
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
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useTheme = () => useAppStore((state) => state.theme);
export const useSelectedMatchId = () => useAppStore((state) => state.selectedMatchId);
export const useSelectedMatchTitle = () => useAppStore((state) => state.selectedMatchTitle);
export const useSelectedPlayerId = () => useAppStore((state) => state.selectedPlayerId);
export const useBreadcrumbs = () => useAppStore((state) => state.breadcrumbs);