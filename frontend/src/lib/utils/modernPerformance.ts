// Modern Performance Monitoring with ES2023 features
import { browser } from '$app/environment';

export interface PerformanceMetrics {
  renderTime: number;
  interactionTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  networkLatency?: number;
}

// Modern performance observer with automatic cleanup
export class ModernPerformanceMonitor {
  private observers: PerformanceObserver[] = [];
  private abortController = new AbortController();
  
  constructor() {
    if (!browser) return;
    
    this.initializeObservers();
  }
  
  private initializeObservers(): void {
    try {
      // Modern long task observer for performance monitoring
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`);
            this.reportMetric('long-task', entry.duration);
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
      
      // Modern navigation timing observer
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.reportMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
            this.reportMetric('load-complete', navEntry.loadEventEnd - navEntry.loadEventStart);
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
      
      // Modern user timing observer for custom metrics
      const userTimingObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.reportMetric(entry.name, entry.duration);
        });
      });
      userTimingObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(userTimingObserver);
      
    } catch (error) {
      console.warn('Performance observers not supported:', error);
    }
  }
  
  // Modern debounced performance reporting
  private reportMetric = this.debounce((name: string, value: number) => {
    if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter: 'modern_svelte5'
      });
    }
  }, 100);
  
  // Modern debouncing with AbortController
  private debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      if (this.abortController.signal.aborted) return;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!this.abortController.signal.aborted) {
          func(...args);
        }
      }, wait);
    };
  }
  
  // Modern component render time measurement
  public measureRender<T>(componentName: string, renderFn: () => T): T {
    if (!browser) return renderFn();
    
    const markStart = `${componentName}-render-start`;
    const markEnd = `${componentName}-render-end`;
    const measureName = `${componentName}-render-time`;
    
    performance.mark(markStart);
    const result = renderFn();
    performance.mark(markEnd);
    performance.measure(measureName, markStart, markEnd);
    
    return result;
  }
  
  // Modern async operation timing with AbortController support
  public async measureAsync<T>(
    operationName: string, 
    asyncFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T> {
    if (!browser) return asyncFn(this.abortController.signal);
    
    const markStart = `${operationName}-start`;
    const markEnd = `${operationName}-end`;
    const measureName = `${operationName}-time`;
    
    performance.mark(markStart);
    
    try {
      const result = await asyncFn(this.abortController.signal);
      performance.mark(markEnd);
      performance.measure(measureName, markStart, markEnd);
      return result;
    } catch (error) {
      performance.mark(markEnd);
      performance.measure(`${measureName}-error`, markStart, markEnd);
      throw error;
    }
  }
  
  // Modern memory usage monitoring
  public getMemoryMetrics(): { used: number; total: number; limit: number } | undefined {
    if (!browser || !('memory' in performance)) return undefined;
    
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize || 0,
      total: memory.totalJSHeapSize || 0,
      limit: memory.jsHeapSizeLimit || 0
    };
  }
  
  // Modern intersection observer for lazy loading performance
  public createLazyLoadObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!this.abortController.signal.aborted) {
          callback(entries);
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options
      }
    );
    
    // Auto-cleanup when monitoring is disposed
    this.abortController.signal.addEventListener('abort', () => {
      observer.disconnect();
    });
    
    return observer;
  }
  
  // Modern Symbol.dispose for automatic resource management (ES2023)
  [Symbol.dispose](): void {
    this.abortController.abort();
    this.observers.forEach(observer => observer.disconnect());
    this.observers.length = 0;
  }
  
  // Manual cleanup method for environments without Symbol.dispose
  public dispose(): void {
    this[Symbol.dispose]();
  }
}

// Modern singleton pattern with lazy initialization
let performanceMonitor: ModernPerformanceMonitor | null = null;

export function getPerformanceMonitor(): ModernPerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new ModernPerformanceMonitor();
  }
  return performanceMonitor;
}

// Modern utility functions for common performance patterns
export const perf = {
  // Modern high-precision timing
  now: (): number => performance.now(),
  
  // Modern mark and measure utilities
  mark: (name: string): PerformanceMark => performance.mark(name),
  
  measure: (name: string, startMark: string, endMark?: string): PerformanceMeasure => {
    return performance.measure(name, startMark, endMark);
  },
  
  // Modern component timing wrapper
  time: <T>(name: string, fn: () => T): T => {
    return getPerformanceMonitor().measureRender(name, fn);
  },
  
  // Modern async timing wrapper
  timeAsync: <T>(name: string, fn: (signal: AbortSignal) => Promise<T>): Promise<T> => {
    return getPerformanceMonitor().measureAsync(name, fn);
  }
};

// Modern cleanup on page unload
if (browser) {
  window.addEventListener('beforeunload', () => {
    performanceMonitor?.[Symbol.dispose]();
  });
}
