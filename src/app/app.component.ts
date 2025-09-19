import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MetaService } from './core/services/meta.service';
import { PerformanceService } from './core/services/performance.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
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
}
