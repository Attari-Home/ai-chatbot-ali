import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SEOMetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private readonly defaultMeta: SEOMetaTags = {
    title: 'Ali Robotics Team - Building the Future, One Robot at a Time',
    description: 'We are a passionate group of students from Ali School dedicated to STEM education through competitive robotics. Join us as we innovate, learn, and compete.',
    keywords: 'robotics, STEM, education, FRC, competition, Dubai, UAE, students, innovation, technology',
    author: 'Ali Robotics Team',
    image: '/assets/images/og-image.jpg',
    url: 'https://ali-robotics.school.ae',
    type: 'website',
    siteName: 'Ali Robotics Team'
  };

  constructor(private meta: Meta, private title: Title) { }

  /**
   * Generate Open Graph meta tags for social sharing
   */
  setOpenGraphMeta(data: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });
    
    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
      this.meta.updateTag({ property: 'og:image:alt', content: data.title });
    }
    
    if (data.url) {
      this.meta.updateTag({ property: 'og:url', content: data.url });
    }

    this.meta.updateTag({ property: 'og:site_name', content: 'Ali Robotics Team' });
  }

  /**
   * Generate Twitter Card meta tags
   */
  setTwitterCardMeta(data: {
    title: string;
    description: string;
    image?: string;
    cardType?: string;
  }): void {
    this.meta.updateTag({ name: 'twitter:card', content: data.cardType || 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    
    if (data.image) {
      this.meta.updateTag({ name: 'twitter:image', content: data.image });
      this.meta.updateTag({ name: 'twitter:image:alt', content: data.title });
    }

    this.meta.updateTag({ name: 'twitter:site', content: '@AliRobotics' });
  }

  /**
   * Set default meta tags for the application
   */
  setDefaultMeta(): void {
    this.updateMeta(this.defaultMeta);
  }

  updateMeta(tags: SEOMetaTags): void {
    const meta = { ...this.defaultMeta, ...tags };

    // Update title
    if (meta.title) {
      this.title.setTitle(meta.title);
    }

    // Update standard meta tags
    this.updateTag('description', meta.description);
    this.updateTag('keywords', meta.keywords);
    this.updateTag('author', meta.author);

    // Update Open Graph tags
    this.updateTag('og:title', meta.title, 'property');
    this.updateTag('og:description', meta.description, 'property');
    this.updateTag('og:image', meta.image, 'property');
    this.updateTag('og:url', meta.url, 'property');
    this.updateTag('og:type', meta.type, 'property');
    this.updateTag('og:site_name', meta.siteName, 'property');

    // Update Twitter Card tags
    this.updateTag('twitter:card', 'summary_large_image', 'name');
    this.updateTag('twitter:title', meta.title, 'name');
    this.updateTag('twitter:description', meta.description, 'name');
    this.updateTag('twitter:image', meta.image, 'name');

    // Update canonical URL
    this.updateCanonicalUrl(meta.url);
  }

  updatePageMeta(title: string, description: string, additionalTags?: Partial<SEOMetaTags>): void {
    const fullTitle = `${title} | Ali Robotics Team`;
    this.updateMeta({
      title: fullTitle,
      description,
      ...additionalTags
    });
  }

  private updateTag(name: string, content?: string, attribute: string = 'name'): void {
    if (content) {
      this.meta.updateTag({ [attribute]: name, content });
    }
  }

  private updateCanonicalUrl(url?: string): void {
    if (url) {
      let link: HTMLLinkElement = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    }
  }

  // Generate structured data for different content types
  generateOrganizationStructuredData(): string {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ali Robotics Team",
      "alternateName": "Ali School Robotics Team",
      "url": "https://ali-robotics.school.ae",
      "logo": "https://ali-robotics.school.ae/assets/images/logo.svg",
      "description": "Student robotics team from Ali School in Dubai, UAE, competing in FIRST Robotics Competition",
      "foundingDate": "2022",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dubai",
        "addressCountry": "UAE"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+971-4-XXX-XXXX",
        "contactType": "customer service",
        "email": "team@ali-robotics.school.ae"
      },
      "sameAs": [
        "https://github.com/ali-robotics",
        "https://instagram.com/ali_robotics"
      ]
    });
  }

  generateEventStructuredData(event: any): string {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.title,
      "description": event.description,
      "startDate": event.date,
      "endDate": event.endDate,
      "location": {
        "@type": "Place",
        "name": event.venue,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": event.location
        }
      },
      "organizer": {
        "@type": "Organization",
        "name": "Ali Robotics Team",
        "url": "https://ali-robotics.school.ae"
      },
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
    });
  }

  generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>): string {
    const itemListElement = breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }));

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    });
  }

  /**
   * Generate comprehensive page meta data with performance optimizations
   */
  setPageMeta(data: {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    canonicalUrl?: string;
  }): void {
    // Set basic meta tags
    this.updateMeta({
      title: data.title,
      description: data.description,
      keywords: data.keywords?.join(', ')
    });

    // Set Open Graph meta tags
    this.setOpenGraphMeta({
      title: data.title,
      description: data.description,
      image: data.image,
      url: data.url,
      type: data.type
    });

    // Set Twitter Card meta tags  
    this.setTwitterCardMeta({
      title: data.title,
      description: data.description,
      image: data.image
    });

    // Set article-specific meta tags
    if (data.publishedTime) {
      this.meta.updateTag({ property: 'article:published_time', content: data.publishedTime });
    }
    
    if (data.modifiedTime) {
      this.meta.updateTag({ property: 'article:modified_time', content: data.modifiedTime });
    }

    if (data.author) {
      this.meta.updateTag({ name: 'author', content: data.author });
    }

    // Set canonical URL
    if (data.canonicalUrl) {
      this.setCanonicalUrl(data.canonicalUrl);
    }
  }

  /**
   * Set canonical URL to prevent duplicate content issues
   */
  setCanonicalUrl(url: string): void {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    canonical.href = url;
  }

  /**
   * Add preload hints for critical resources
   */
  addPreloadHints(resources: Array<{
    href: string;
    as: string;
    type?: string;
    crossorigin?: boolean;
  }>): void {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) {
        link.type = resource.type;
      }
      
      if (resource.crossorigin) {
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }
}