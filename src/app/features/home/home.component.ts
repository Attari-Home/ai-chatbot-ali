import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImageOptimizationService } from '../../core/services/image-optimization.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  content = {
    hero: {
      title: 'Welcome to ALI Robotics',
      subtitle: 'Advancing Learning through Innovation - Building the future with robotics and AI',
      primaryCta: 'Explore Projects',
      secondaryCta: 'Learn More'
    },
    mission: {
      title: 'Our Mission',
      description: 'To advance learning and innovation through cutting-edge robotics and artificial intelligence research.',
      features: [
        {
          icon: 'fas fa-robot',
          title: 'Robotics Research',
          description: 'Pioneering research in autonomous systems and intelligent robotics'
        },
        {
          icon: 'fas fa-brain',
          title: 'AI Innovation',
          description: 'Developing advanced AI algorithms for real-world applications'
        },
        {
          icon: 'fas fa-graduation-cap',
          title: 'Education',
          description: 'Training the next generation of robotics and AI experts'
        }
      ]
    }
  };

  projects = [
    {
      id: 1,
      title: 'Autonomous Navigation System',
      description: 'Advanced robotic navigation using computer vision and machine learning',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop&auto=format',
      category: 'Robotics',
      status: 'Active'
    },
    {
      id: 2,
      title: 'AI-Powered Assistant',
      description: 'Intelligent virtual assistant with natural language processing',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&auto=format',
      category: 'AI',
      status: 'Completed'
    },
    {
      id: 3,
      title: 'Educational Robot Platform',
      description: 'Interactive robotics platform for STEM education',
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop&auto=format',
      category: 'Education',
      status: 'In Development'
    }
  ];

  newsItems = [
    {
      id: 1,
      title: 'ALI Robotics Wins Innovation Award',
      excerpt: 'Our autonomous navigation project has been recognized with the Tech Innovation Award 2024',
      date: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop&auto=format'
    },
    {
      id: 2,
      title: 'New Partnership with Tech University',
      excerpt: 'Collaborative research program launched to advance AI education',
      date: '2024-02-28',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop&auto=format'
    }
  ];

  constructor(private imageService: ImageOptimizationService, private themeService: ThemeService) { }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  // Handle image load errors
  onImageError(event: Event, category: 'logo' | 'project' | 'news' = 'project'): void {
    this.imageService.handleImageError(event, category);
  }

  // Get optimized image URL
  getImageUrl(url: string, category: 'logo' | 'project' | 'news' = 'project'): string {
    return this.imageService.getOptimizedImageUrl(url, category);
  }

  ngOnInit(): void {
  }

}
