import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

export interface ContentManifest {
  version: string;
  lastUpdated: string;
  contentTypes: {
    teamMembers: ContentTypeInfo;
    projects: ContentTypeInfo;
    events: ContentTypeInfo;
    news: ContentTypeInfo;
    blogPosts: ContentTypeInfo;
    sponsors: ContentTypeInfo;
  };
}

export interface ContentTypeInfo {
  file: string;
  count: number;
  lastModified: string;
  schema: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentImportService {
  private readonly BASE_PATH = '/assets/data/';
  private readonly SCHEMA_PATH = '/assets/schemas/';

  constructor(private http: HttpClient) { }

  /**
   * Get content manifest with metadata about all content files
   */
  getContentManifest(): Observable<ContentManifest> {
    return this.http.get<ContentManifest>(`${this.BASE_PATH}content-manifest.json`);
  }

  /**
   * Import all content data
   */
  importAllContent(): Observable<{
    teamMembers: any[];
    projects: any[];
    events: any[];
    news: any[];
    blogPosts: any[];
    sponsors: any[];
  }> {
    return forkJoin({
      teamMembers: this.importTeamMembers(),
      projects: this.importProjects(),
      events: this.importEvents(),
      news: this.importNews(),
      blogPosts: this.importBlogPosts(),
      sponsors: this.importSponsors()
    });
  }

  /**
   * Import team members data
   */
  importTeamMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_PATH}team-members.json`);
  }

  /**
   * Import projects data
   */
  importProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_PATH}projects.json`);
  }

  /**
   * Import events data
   */
  importEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_PATH}events.json`);
  }

  /**
   * Import news articles data
   */
  importNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_PATH}news.json`);
  }

  /**
   * Import blog posts data
   */
  importBlogPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_PATH}blog-posts.json`);
  }

  /**
   * Import sponsors data
   */
  importSponsors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_PATH}sponsors.json`);
  }

  /**
   * Search across all content types
   */
  searchContent(query: string): Observable<{
    teamMembers: any[];
    projects: any[];
    events: any[];
    news: any[];
    blogPosts: any[];
    sponsors: any[];
  }> {
    return this.importAllContent().pipe(
      map(content => ({
        teamMembers: this.filterContent(content.teamMembers, query),
        projects: this.filterContent(content.projects, query),
        events: this.filterContent(content.events, query),
        news: this.filterContent(content.news, query),
        blogPosts: this.filterContent(content.blogPosts, query),
        sponsors: this.filterContent(content.sponsors, query)
      }))
    );
  }

  /**
   * Get content by category and filters
   */
  getFilteredContent(
    contentType: 'teamMembers' | 'projects' | 'events' | 'news' | 'blogPosts' | 'sponsors',
    filters: any = {}
  ): Observable<any[]> {
    let contentObservable: Observable<any[]>;

    switch (contentType) {
      case 'teamMembers':
        contentObservable = this.importTeamMembers();
        break;
      case 'projects':
        contentObservable = this.importProjects();
        break;
      case 'events':
        contentObservable = this.importEvents();
        break;
      case 'news':
        contentObservable = this.importNews();
        break;
      case 'blogPosts':
        contentObservable = this.importBlogPosts();
        break;
      case 'sponsors':
        contentObservable = this.importSponsors();
        break;
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }

    return contentObservable.pipe(
      map(content => this.applyFilters(content, filters))
    );
  }

  /**
   * Get featured content across all types
   */
  getFeaturedContent(): Observable<{
    teamMembers: any[];
    projects: any[];
    events: any[];
    news: any[];
    blogPosts: any[];
    sponsors: any[];
  }> {
    return this.importAllContent().pipe(
      map(content => ({
        teamMembers: content.teamMembers.filter(item => item.featured),
        projects: content.projects.filter(item => item.featured),
        events: content.events.filter(item => item.featured),
        news: content.news.filter(item => item.featured),
        blogPosts: content.blogPosts.filter(item => item.featured),
        sponsors: content.sponsors.filter(item => item.featured)
      }))
    );
  }

  /**
   * Get recent content (last 30 days)
   */
  getRecentContent(): Observable<{
    events: any[];
    news: any[];
    blogPosts: any[];
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return forkJoin({
      events: this.importEvents(),
      news: this.importNews(),
      blogPosts: this.importBlogPosts()
    }).pipe(
      map(content => ({
        events: content.events.filter(item => 
          new Date(item.startDate || item.publishedDate) >= thirtyDaysAgo
        ),
        news: content.news.filter(item => 
          new Date(item.publishedDate) >= thirtyDaysAgo
        ),
        blogPosts: content.blogPosts.filter(item => 
          new Date(item.publishedDate) >= thirtyDaysAgo
        )
      }))
    );
  }

  /**
   * Get content statistics
   */
  getContentStatistics(): Observable<{
    totalTeamMembers: number;
    totalProjects: number;
    totalEvents: number;
    totalNews: number;
    totalBlogPosts: number;
    totalSponsors: number;
    lastUpdated: string;
  }> {
    return this.importAllContent().pipe(
      map(content => ({
        totalTeamMembers: content.teamMembers.length,
        totalProjects: content.projects.length,
        totalEvents: content.events.length,
        totalNews: content.news.length,
        totalBlogPosts: content.blogPosts.length,
        totalSponsors: content.sponsors.length,
        lastUpdated: new Date().toISOString()
      }))
    );
  }

  /**
   * Validate content against schemas
   */
  validateContent(contentType: string, data: any[]): Observable<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return this.http.get(`${this.SCHEMA_PATH}${contentType}-schema.json`).pipe(
      map(schema => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic validation (in a real application, you'd use a JSON schema validator)
        data.forEach((item, index) => {
          if (!item.id) {
            errors.push(`Item ${index} missing required field: id`);
          }
          if (!item.title && !item.name) {
            errors.push(`Item ${index} missing required field: title or name`);
          }
        });

        return {
          valid: errors.length === 0,
          errors,
          warnings
        };
      })
    );
  }

  /**
   * Export content for backup or migration
   */
  exportContent(): Observable<{
    manifest: ContentManifest;
    data: any;
    exportDate: string;
  }> {
    return forkJoin({
      manifest: this.getContentManifest(),
      content: this.importAllContent()
    }).pipe(
      map(({ manifest, content }) => ({
        manifest,
        data: content,
        exportDate: new Date().toISOString()
      }))
    );
  }

  /**
   * Filter content by search query
   */
  private filterContent(content: any[], query: string): any[] {
    if (!query || query.trim() === '') {
      return content;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return content.filter(item => {
      const searchableText = [
        item.title,
        item.name,
        item.description,
        item.excerpt,
        item.content,
        ...(item.tags || []),
        ...(item.skills || []),
        item.role,
        item.category
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }

  /**
   * Apply filters to content
   */
  private applyFilters(content: any[], filters: any): any[] {
    let filtered = [...content];

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags && filters.tags.some((tag: string) => item.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.publishedDate || item.startDate);
        return itemDate >= new Date(filters.startDate) && itemDate <= new Date(filters.endDate);
      });
    }

    // Featured filter
    if (filters.featured !== undefined) {
      filtered = filtered.filter(item => item.featured === filters.featured);
    }

    // Limit results
    if (filters.limit && filters.limit > 0) {
      filtered = filtered.slice(0, filters.limit);
    }

    // Sort results
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy];
        const bValue = b[filters.sortBy];
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }
}