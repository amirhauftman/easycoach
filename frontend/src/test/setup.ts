import { vi } from 'vitest';

// Mock Chart.js
vi.mock('chart.js', () => ({
    Chart: vi.fn().mockImplementation(() => ({
        destroy: vi.fn(),
        update: vi.fn(),
        resize: vi.fn(),
    })),
    registerables: [],
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
    Radar: vi.fn().mockImplementation(() => null),
}));

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: vi.fn(() => ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: [] })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: [] })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        fillText: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        transform: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
    })),
});