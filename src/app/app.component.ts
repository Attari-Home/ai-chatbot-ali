import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MetaService } from './core/services/meta.service';
import { PerformanceService } from './core/services/performance.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Ali Robotics Team';
  isMobileMenuOpen = false;
  private bubbleInterval: any;
  private cursorInterval: any;
  private readonly BUBBLE_COUNT = 20;

  constructor(
    private metaService: MetaService,
    private performanceService: PerformanceService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Set default meta tags and structured data
    this.metaService.setDefaultMeta();
    
    // Add organization structured data
    this.addStructuredData(this.metaService.generateOrganizationStructuredData());

    // Initialize performance monitoring in development
    if (!this.isProduction()) {
      setTimeout(() => {
        this.performanceService.generatePerformanceReport();
      }, 3000);
    }

    // Preconnect to external domains for better performance
    this.performanceService.preconnectDomain('https://fonts.googleapis.com', true);
    this.performanceService.preconnectDomain('https://fonts.gstatic.com', true);

    // Initialize animations
    this.initBubbles();
    this.initCursorBubbles();
    this.initPageTransitions();
  }

  private pageTransitionHandler: ((event: Event) => void) | null = null;

  private initPageTransitions(): void {
    const content = document.querySelector('router-outlet');
    if (content) {
      this.pageTransitionHandler = () => {
        const elements = document.querySelectorAll('.slide-in-right, .slide-in-left, .slide-in-up, .fade-in');
        elements.forEach(element => {
          (element as HTMLElement).style.opacity = '0';
          setTimeout(() => {
            (element as HTMLElement).style.opacity = '1';
          }, 100);
        });
      };
      
      content.addEventListener('activate', this.pageTransitionHandler);
    }
  }

  private addStructuredData(data: string): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = data;
    document.head.appendChild(script);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%234B5563" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>';
    img.alt = 'Ali Robotics Team (Logo not found)';
  }

  private isProduction(): boolean {
    return false; // This would normally check environment.production
  }

  private createBubble(): void {
    const bubble = document.createElement('div');
    const size = Math.random() > 0.5 ? 'bubble-sm' : Math.random() > 0.5 ? 'bubble-md' : 'bubble-lg';
    bubble.className = `bubble ${size}`;
    
    // Random position
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.top = `${Math.random() * 100}%`;
    
    // Random animation duration
    const duration = 3 + Math.random() * 4;
    bubble.style.animationDuration = `${duration}s`;
    
    document.body.appendChild(bubble);
    
    // Remove bubble after animation
    setTimeout(() => bubble.remove(), duration * 1000);
  }

  private initBubbles(): void {
    // Create initial bubbles
    for (let i = 0; i < 10; i++) {
      setTimeout(() => this.createBubble(), i * 300);
    }

    // Create new bubbles periodically
    this.bubbleInterval = setInterval(() => this.createBubble(), 3000);
  }

  private initCursorBubbles(): void {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-bubble';
    document.body.appendChild(cursor);

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      
      // Occasionally create a bubble at cursor position
      if (Math.random() > 0.9) { // 10% chance to create bubble
        const bubble = document.createElement('div');
        bubble.className = 'bubble bubble-sm';
        bubble.style.left = `${e.clientX}px`;
        bubble.style.top = `${e.clientY}px`;
        document.body.appendChild(bubble);
        
        setTimeout(() => bubble.remove(), 2000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Store the event listener for cleanup
    this.cursorInterval = handleMouseMove;
  }

  ngOnDestroy(): void {
    // Cleanup intervals and event listeners
    if (this.bubbleInterval) {
      clearInterval(this.bubbleInterval);
    }
    
    if (this.cursorInterval) {
      document.removeEventListener('mousemove', this.cursorInterval);
    }
    
    // Cleanup page transition handler
    if (this.pageTransitionHandler) {
      const content = document.querySelector('router-outlet');
      if (content) {
        content.removeEventListener('activate', this.pageTransitionHandler);
      }
    }
    
    // Remove any remaining bubbles
    const bubbles = document.querySelectorAll('.bubble, .cursor-bubble');
    bubbles.forEach(bubble => bubble.remove());
  }
}
