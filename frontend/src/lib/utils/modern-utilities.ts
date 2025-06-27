/**
 * Modern utilities for Svelte 5 + Vite 7 + Node.js 22
 * Advanced patterns using runes and modern JavaScript features
 */

import { tick } from 'svelte';

// Node.js 22 AbortController for advanced cancellation
export function createAbortableEffect() {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    cleanup: () => controller.abort()
  };
}

// Modern performance observer utility
export function createPerformanceObserver() {
  let metrics = $state({
    renderTime: 0,
    layoutShift: 0,
    interactionDelay: 0
  });

  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Observe Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          metrics.renderTime = entry.duration;
        } else if (entry.entryType === 'layout-shift') {
          metrics.layoutShift += (entry as any).value;
        }
      }
    });

    observer.observe({ entryTypes: ['measure', 'layout-shift'] });

    return {
      metrics: () => metrics,
      startMeasure: (name: string) => performance.mark(`${name}-start`),
      endMeasure: (name: string) => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      },
      cleanup: () => observer.disconnect()
    };
  }

  return {
    metrics: () => metrics,
    startMeasure: () => {},
    endMeasure: () => {},
    cleanup: () => {}
  };
}

// Advanced reactive viewport utility with modern patterns
export function createViewportTracker() {
  let viewport = $state({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    pixelRatio: 1
  });

  const updateViewport = () => {
    if (typeof window === 'undefined') return;
    
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    viewport.isMobile = window.innerWidth < 768;
    viewport.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    viewport.isDesktop = window.innerWidth >= 1024;
    viewport.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    viewport.pixelRatio = window.devicePixelRatio || 1;
  };

  // Modern ResizeObserver for better performance
  let resizeObserver: ResizeObserver | null = null;
  
  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(document.documentElement);
    updateViewport(); // Initial call
  }

  return {
    viewport: () => viewport,
    cleanup: () => resizeObserver?.disconnect()
  };
}

// Modern intersection observer utility
export function createIntersectionObserver(threshold = 0.1) {
  let isVisible = $state(false);
  let intersectionRatio = $state(0);
  
  const observe = (element: Element) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      isVisible = true;
      return () => {};
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        intersectionRatio = entry.intersectionRatio;
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  };

  return {
    isVisible: () => isVisible,
    intersectionRatio: () => intersectionRatio,
    observe
  };
}

// Modern async utilities with Node.js 22 improvements
export async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number, 
  signal?: AbortSignal
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Aborted'));
      });
    })
  ]);
}

// Modern debounce with AbortController
export function createDebouncer(delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentController: AbortController | null = null;

  return <T extends (...args: any[]) => any>(fn: T) => {
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      // Cancel previous call
      if (currentController) {
        currentController.abort();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      currentController = new AbortController();
      const controller = currentController;

      return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          if (!controller.signal.aborted) {
            try {
              resolve(fn(...args));
            } catch (error) {
              reject(error);
            }
          }
        }, delay);

        controller.signal.addEventListener('abort', () => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(new Error('Debounced function call aborted'));
        });
      });
    };
  };
}

// Modern local storage with reactivity
export function createReactiveStorage<T>(key: string, defaultValue: T) {
  let storedValue = $state<T>(defaultValue);

  // Initialize from localStorage
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        storedValue = JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Failed to parse localStorage item "${key}":`, error);
    }
  }

  // Reactive setter that updates localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value;
    storedValue = newValue;
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn(`Failed to save to localStorage "${key}":`, error);
      }
    }
  };

  return {
    value: () => storedValue,
    setValue,
    clear: () => {
      setValue(defaultValue);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  };
}

// Modern theme utilities with CSS custom properties
export function createThemeManager() {
  let currentTheme = $state<'light' | 'dark' | 'auto'>('auto');
  let resolvedTheme = $state<'light' | 'dark'>('light');

  const applyTheme = (theme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return;
    
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    resolvedTheme = theme;
  };

  const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    currentTheme = theme;
    
    if (theme === 'auto') {
      // Use system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
        
        // Listen for changes
        mediaQuery.addEventListener('change', (e) => {
          if (currentTheme === 'auto') {
            applyTheme(e.matches ? 'dark' : 'light');
          }
        });
      } else {
        applyTheme('light');
      }
    } else {
      applyTheme(theme);
    }
  };

  // Initialize with auto theme
  setTheme('auto');

  return {
    currentTheme: () => currentTheme,
    resolvedTheme: () => resolvedTheme,
    setTheme,
    toggleTheme: () => {
      const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    }
  };
}
