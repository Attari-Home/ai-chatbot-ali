import { Injectable } from '@angular/core';

export interface ImageOptimization {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcset?: string;
  width?: number;
  height?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  
  private readonly defaultSizes = {
    hero: { width: 1920, height: 1080 },
    card: { width: 400, height: 300 },
    thumbnail: { width: 150, height: 150 },
    profile: { width: 300, height: 300 },
    banner: { width: 1200, height: 400 }
  };

  constructor() { }

  /**
   * Generate optimized image configuration for responsive images
   */
  optimizeImage(
    src: string, 
    alt: string, 
    type: 'hero' | 'card' | 'thumbnail' | 'profile' | 'banner' = 'card',
    eager: boolean = false
  ): ImageOptimization {
    const dimensions = this.defaultSizes[type];
    const baseName = this.getBaseName(src);
    
    return {
      src: src,
      alt: alt,
      loading: eager ? 'eager' : 'lazy',
      width: dimensions.width,
      height: dimensions.height,
      sizes: this.generateSizes(type),
      srcset: this.generateSrcSet(baseName, type)
    };
  }

  /**
   * Generate responsive image sizes attribute
   */
  private generateSizes(type: string): string {
    const sizeMap = {
      hero: '100vw',
      card: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
      thumbnail: '150px',
      profile: '(max-width: 768px) 150px, 300px',
      banner: '100vw'
    };
    
    return sizeMap[type as keyof typeof sizeMap] || '100vw';
  }

  /**
   * Generate srcset for different screen densities and sizes
   */
  private generateSrcSet(baseName: string, type: string): string {
    const variants = this.getImageVariants(type);
    
    return variants
      .map(variant => `${baseName}-${variant.suffix}.webp ${variant.width}w`)
      .join(', ');
  }

  /**
   * Get image variants for different screen sizes
   */
  private getImageVariants(type: string) {
    const variantMap = {
      hero: [
        { suffix: 'sm', width: 768 },
        { suffix: 'md', width: 1024 },
        { suffix: 'lg', width: 1440 },
        { suffix: 'xl', width: 1920 }
      ],
      card: [
        { suffix: 'sm', width: 200 },
        { suffix: 'md', width: 400 },
        { suffix: 'lg', width: 600 }
      ],
      thumbnail: [
        { suffix: 'sm', width: 75 },
        { suffix: 'md', width: 150 },
        { suffix: 'lg', width: 300 }
      ],
      profile: [
        { suffix: 'sm', width: 150 },
        { suffix: 'md', width: 300 },
        { suffix: 'lg', width: 600 }
      ],
      banner: [
        { suffix: 'sm', width: 600 },
        { suffix: 'md', width: 900 },
        { suffix: 'lg', width: 1200 },
        { suffix: 'xl', width: 1800 }
      ]
    };

    return variantMap[type as keyof typeof variantMap] || variantMap.card;
  }

  /**
   * Extract base name from image path
   */
  private getBaseName(src: string): string {
    const pathParts = src.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const baseName = fileName.split('.')[0];
    const directory = pathParts.slice(0, -1).join('/');
    
    return `${directory}/${baseName}`;
  }

  /**
   * Generate WebP fallback configuration
   */
  generateWebPFallback(src: string, alt: string, type: string = 'card'): {
    webp: ImageOptimization;
    fallback: ImageOptimization;
  } {
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    return {
      webp: this.optimizeImage(webpSrc, alt, type as any),
      fallback: this.optimizeImage(src, alt, type as any)
    };
  }

  /**
   * Preload critical images
   */
  preloadImage(src: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }

  /**
   * Lazy load images with Intersection Observer
   */
  lazyLoadImages(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset['src']) {
              img.src = img.dataset['src'];
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }
}