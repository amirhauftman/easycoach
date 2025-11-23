import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, useToastStore } from '../useToast';

describe('useToastStore', () => {
    beforeEach(() => {
        // Clear the store before each test
        useToastStore.getState().clearAll();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with empty toasts array', () => {
        const { result } = renderHook(() => useToastStore());

        expect(result.current.toasts).toEqual([]);
    });

    it('should add a toast with generated ID', () => {
        const { result } = renderHook(() => useToastStore());

        act(() => {
            result.current.addToast({
                message: 'Test message',
                type: 'success',
                duration: 3000
            });
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0]).toMatchObject({
            message: 'Test message',
            type: 'success',
            duration: 3000
        });
        expect(result.current.toasts[0].id).toMatch(/^toast-\d+-\d+/);
    });

    it('should add multiple toasts', () => {
        const { result } = renderHook(() => useToastStore());

        act(() => {
            result.current.addToast({ message: 'First toast', type: 'success' });
            result.current.addToast({ message: 'Second toast', type: 'error' });
        });

        expect(result.current.toasts).toHaveLength(2);
        expect(result.current.toasts[0].message).toBe('First toast');
        expect(result.current.toasts[1].message).toBe('Second toast');
    });

    it('should generate unique IDs for each toast', () => {
        const { result } = renderHook(() => useToastStore());

        act(() => {
            result.current.addToast({ message: 'Toast 1', type: 'success' });
            result.current.addToast({ message: 'Toast 2', type: 'info' });
        });

        const [toast1, toast2] = result.current.toasts;
        expect(toast1.id).not.toBe(toast2.id);
        expect(toast1.id).toBeTruthy();
        expect(toast2.id).toBeTruthy();
    });

    it('should remove a specific toast by ID', () => {
        const { result } = renderHook(() => useToastStore());

        act(() => {
            result.current.addToast({ message: 'Toast 1', type: 'success' });
            result.current.addToast({ message: 'Toast 2', type: 'error' });
        });

        const toastIdToRemove = result.current.toasts[0].id;

        act(() => {
            result.current.removeToast(toastIdToRemove);
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].message).toBe('Toast 2');
    });

    it('should not affect other toasts when removing non-existent ID', () => {
        const { result } = renderHook(() => useToastStore());

        act(() => {
            result.current.addToast({ message: 'Test toast', type: 'success' });
        });

        act(() => {
            result.current.removeToast('non-existent-id');
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].message).toBe('Test toast');
    });

    it('should clear all toasts', () => {
        const { result } = renderHook(() => useToastStore());

        act(() => {
            result.current.addToast({ message: 'Toast 1', type: 'success' });
            result.current.addToast({ message: 'Toast 2', type: 'error' });
            result.current.addToast({ message: 'Toast 3', type: 'warning' });
        });

        expect(result.current.toasts).toHaveLength(3);

        act(() => {
            result.current.clearAll();
        });

        expect(result.current.toasts).toEqual([]);
    });

    it('should handle adding toast without duration', () => {
        const { result } = renderHook(() => useToastStore());

        act(() => {
            result.current.addToast({
                message: 'Toast without duration',
                type: 'info'
            });
        });

        expect(result.current.toasts[0]).toMatchObject({
            message: 'Toast without duration',
            type: 'info'
        });
        expect(result.current.toasts[0].duration).toBeUndefined();
    });
});

describe('useToast', () => {
    beforeEach(() => {
        useToastStore.getState().clearAll();
        // Mock Date.now to have predictable IDs in tests
        vi.spyOn(Date, 'now').mockReturnValue(1234567890);
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should provide success toast function', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.success('Success message');
        });

        expect(storeResult.current.toasts).toHaveLength(1);
        expect(storeResult.current.toasts[0]).toMatchObject({
            message: 'Success message',
            type: 'success'
        });
    });

    it('should provide error toast function', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.error('Error message');
        });

        expect(storeResult.current.toasts).toHaveLength(1);
        expect(storeResult.current.toasts[0]).toMatchObject({
            message: 'Error message',
            type: 'error'
        });
    });

    it('should provide warning toast function', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.warning('Warning message');
        });

        expect(storeResult.current.toasts).toHaveLength(1);
        expect(storeResult.current.toasts[0]).toMatchObject({
            message: 'Warning message',
            type: 'warning'
        });
    });

    it('should provide info toast function', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.info('Info message');
        });

        expect(storeResult.current.toasts).toHaveLength(1);
        expect(storeResult.current.toasts[0]).toMatchObject({
            message: 'Info message',
            type: 'info'
        });
    });

    it('should accept custom duration for all toast types', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.success('Success with duration', 5000);
            result.current.error('Error with duration', 4000);
            result.current.warning('Warning with duration', 3000);
            result.current.info('Info with duration', 2000);
        });

        expect(storeResult.current.toasts).toHaveLength(4);
        expect(storeResult.current.toasts[0].duration).toBe(5000);
        expect(storeResult.current.toasts[1].duration).toBe(4000);
        expect(storeResult.current.toasts[2].duration).toBe(3000);
        expect(storeResult.current.toasts[3].duration).toBe(2000);
    });

    it('should work without duration parameter', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.success('Success without duration');
        });

        expect(storeResult.current.toasts[0].duration).toBeUndefined();
    });

    it('should create multiple toasts with different types', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.success('Success message');
            result.current.error('Error message');
            result.current.warning('Warning message');
            result.current.info('Info message');
        });

        expect(storeResult.current.toasts).toHaveLength(4);

        const types = storeResult.current.toasts.map(t => t.type);
        expect(types).toEqual(['success', 'error', 'warning', 'info']);
    });



    it('should handle empty messages', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.success('');
        });

        expect(storeResult.current.toasts).toHaveLength(1);
        expect(storeResult.current.toasts[0].message).toBe('');
    });

    it('should handle very long messages', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        const longMessage = 'A'.repeat(1000);

        act(() => {
            result.current.info(longMessage);
        });

        expect(storeResult.current.toasts).toHaveLength(1);
        expect(storeResult.current.toasts[0].message).toBe(longMessage);
    });

    it('should handle zero duration', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.success('Zero duration toast', 0);
        });

        expect(storeResult.current.toasts[0].duration).toBe(0);
    });

    it('should handle negative duration', () => {
        const { result } = renderHook(() => useToast());
        const { result: storeResult } = renderHook(() => useToastStore());

        act(() => {
            result.current.error('Negative duration toast', -1000);
        });

        expect(storeResult.current.toasts[0].duration).toBe(-1000);
    });
});