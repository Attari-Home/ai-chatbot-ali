import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MetaService } from './core/services/meta.service';
import { PerformanceService } from './core/services/performance.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Ali Robotics Team';

  constructor(
    private metaService: MetaService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit(): void {
    // Set default meta tags and structured data
    this.metaService.setDefaultMeta();
    
    // Add organization structured data
    this.addStructuredData(this.metaService.generateOrganizationStructuredData());

    // Initialize performance monitoring in development
    if (!this.isProduction()) {
      // Generate performance report after 3 seconds
      setTimeout(() => {
        this.performanceService.generatePerformanceReport();
      }, 3000);
    }

    // Preconnect to external domains for better performance
    this.performanceService.preconnectDomain('https://fonts.googleapis.com', true);
    this.performanceService.preconnectDomain('https://fonts.gstatic.com', true);

    // Initialize bubble animations
    this.initBubbles();
    this.initCursorBubbles();
  }

  private addStructuredData(data: string): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = data;
    document.head.appendChild(script);
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
    setInterval(() => this.createBubble(), 3000);
  }

  private initCursorBubbles(): void {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-bubble';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  }
}
