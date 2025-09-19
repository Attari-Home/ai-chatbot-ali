import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.logPerformanceMetric(entry);
        });
      });

      // Observe various performance metrics
      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported for all entry types');
      }
    }
  }

  /**
   * Log performance metrics for analysis
   */
  private logPerformanceMetric(entry: PerformanceEntry): void {
    // Only log in development mode
    if (this.isDevelopment()) {
      console.group(`Performance Metric: ${entry.entryType}`);
      console.log('Name:', entry.name);
      console.log('Duration:', entry.duration);
      console.log('Start Time:', entry.startTime);
      
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        console.log('DOM Content Loaded:', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
        console.log('Load Complete:', navEntry.loadEventEnd - navEntry.loadEventStart);
        console.log('First Paint:', this.getFirstPaint());
        console.log('First Contentful Paint:', this.getFirstContentfulPaint());
      }
      
      console.groupEnd();
    }
  }

  /**
   * Get First Paint timing
   */
  getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime || 0;
  }

  /**
   * Get First Contentful Paint timing
   */
  getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp?.startTime || 0;
  }

  /**
   * Get Core Web Vitals metrics
   */
  getCoreWebVitals(): Promise<{
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  }> {
    return new Promise((resolve) => {
      const metrics = {
        fcp: this.getFirstContentfulPaint(),
        lcp: 0,
        fid: 0,
        cls: 0
      };

      // Measure Largest Contentful Paint
      this.measureLCP().then(lcp => {
        metrics.lcp = lcp;
        
        // Measure First Input Delay and Cumulative Layout Shift
        Promise.all([
          this.measureFID(),
          this.measureCLS()
        ]).then(([fid, cls]) => {
          metrics.fid = fid;
          metrics.cls = cls;
          resolve(metrics);
        });
      });
    });
  }

  /**
   * Measure Largest Contentful Paint
   */
  private measureLCP(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
          observer.disconnect();
        });

        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          resolve(0);
        }
      } else {
        resolve(0);
      }
    });
  }

  /**
   * Measure First Input Delay
   */
  private measureFID(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-input') {
              resolve(entry.processingStart - entry.startTime);
              observer.disconnect();
            }
          });
        });

        try {
          observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          resolve(0);
        }
      } else {
        resolve(0);
      }
    });
  }

  /**
   * Measure Cumulative Layout Shift
   */
  private measureCLS(): Promise<number> {
    return new Promise((resolve) => {
      let clsValue = 0;

      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });

        try {
          observer.observe({ entryTypes: ['layout-shift'] });
          
          // Resolve after 5 seconds of observation
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 5000);
        } catch (e) {
          resolve(0);
        }
      } else {
        resolve(0);
      }
    });
  }

  /**
   * Prefetch resources for improved performance
   */
  prefetchResource(url: string, as?: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    if (as) {
      link.as = as;
    }
    
    document.head.appendChild(link);
  }

  /**
   * Preconnect to external domains
   */
  preconnectDomain(domain: string, crossorigin: boolean = false): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    
    if (crossorigin) {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }

  /**
   * Check if running in development mode
   */
  private isDevelopment(): boolean {
    return !environment.production;
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): void {
    this.getCoreWebVitals().then(metrics => {
      console.group('Performance Report');
      console.log('First Contentful Paint:', `${metrics.fcp.toFixed(2)}ms`);
      console.log('Largest Contentful Paint:', `${metrics.lcp.toFixed(2)}ms`);
      console.log('First Input Delay:', `${metrics.fid.toFixed(2)}ms`);
      console.log('Cumulative Layout Shift:', metrics.cls.toFixed(4));
      
      // Performance recommendations
      console.group('Recommendations');
      if (metrics.fcp > 1800) {
        console.warn('FCP is slow. Consider optimizing critical resources.');
      }
      if (metrics.lcp > 2500) {
        console.warn('LCP is slow. Optimize your largest content element.');
      }
      if (metrics.fid > 100) {
        console.warn('FID is poor. Reduce JavaScript execution time.');
      }
      if (metrics.cls > 0.1) {
        console.warn('CLS is poor. Ensure size attributes on media elements.');
      }
      console.groupEnd();
      console.groupEnd();
    });
  }
}

// Environment import (this would normally be from your environment file)
const environment = {
  production: false
};