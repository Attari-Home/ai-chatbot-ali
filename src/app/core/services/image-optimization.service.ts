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

  // Fallback images for different categories
  private fallbackImages = {
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSIjNEY0NkU1Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiPkFMSTwvdGV4dD4KPC9zdmc+',
    project: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Project+Image',
    news: 'https://via.placeholder.com/400x300/4f46e5/ffffff?text=News+Image',
    team: 'https://via.placeholder.com/300x300/9ca3af/ffffff?text=Team+Member',
    blog: 'https://via.placeholder.com/600x400/8b5cf6/ffffff?text=Blog+Post',
    event: 'https://via.placeholder.com/600x400/0ea5e9/ffffff?text=Event+Image',
    sponsor: 'https://via.placeholder.com/200x100/6b7280/ffffff?text=Sponsor+Logo'
  };

  // Get optimized image URL with fallback
  getOptimizedImageUrl(originalUrl: string, category: keyof typeof this.fallbackImages = 'project', width?: number, height?: number): string {
    if (!originalUrl) {
      return this.fallbackImages[category];
    }

    // If it's already a placeholder or data URL, return as is
    if (originalUrl.includes('placeholder') || originalUrl.startsWith('data:')) {
      return originalUrl;
    }

    // If it's an Unsplash URL, ensure proper parameters
    if (originalUrl.includes('unsplash.com')) {
      const url = new URL(originalUrl);
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      if (!url.searchParams.has('fit')) url.searchParams.set('fit', 'crop');
      if (!url.searchParams.has('auto')) url.searchParams.set('auto', 'format');
      return url.toString();
    }

    return originalUrl;
  }

  // Get fallback image for a specific category
  getFallbackImage(category: keyof typeof this.fallbackImages): string {
    return this.fallbackImages[category];
  }

  // Handle image load error
  handleImageError(event: Event, category: keyof typeof this.fallbackImages = 'project'): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('placeholder') && !img.src.startsWith('data:')) {
      img.src = this.fallbackImages[category];
    }
  }

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