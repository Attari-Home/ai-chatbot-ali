import { Injectable } from '@angular/core';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  searchTime: number;
  totalResults: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSearchService {
  private readonly API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual API key
  private readonly SEARCH_ENGINE_ID = 'YOUR_SEARCH_ENGINE_ID_HERE'; // For Google Custom Search
  private readonly BING_API_KEY = 'YOUR_BING_API_KEY_HERE'; // Alternative: Bing Search API

  constructor() { }

  /**
   * Check if a query is UAE-related
   */
  isUAERelated(query: string): boolean {
    const lowerQuery = query.toLowerCase().trim();

    // Skip very short queries (less than 3 words) to avoid false positives
    const words = lowerQuery.split(/\s+/);
    if (words.length < 2) {
      return false;
    }

    // First check for explicit UAE mentions
    const explicitUAE = ['uae', 'united arab emirates', 'emirates', 'emirati'];
    if (explicitUAE.some(keyword => lowerQuery.includes(keyword))) {
      return true;
    }

    // Check for specific UAE cities/emirates
    const uaeLocations = [
      'dubai', 'abu dhabi', 'sharjah', 'ajman', 'fujairah',
      'ras al khaimah', 'umm al quwain'
    ];
    if (uaeLocations.some(location => lowerQuery.includes(location))) {
      return true;
    }

    // Check for UAE-specific landmarks and attractions
    const uaeLandmarks = [
      'burj khalifa', 'burj al arab', 'palm jumeirah', 'palm jebel ali',
      'dubai mall', 'dubai fountain', 'dubai frame', 'dubai creek',
      'sheikh zayed grand mosque', 'louvre abu dhabi', 'yas island',
      'ferrari world', 'atlantis the palm', 'seven stars', 'gold souk',
      'spice souk', 'deira', 'jumeirah', 'marina', 'festival city',
      'mall of emirates', 'dubai festival city', 'atlantis', 'seven stars',
      'desert safari', 'dune bashing', 'falcon hospital', 'dubai healthcare city'
    ];
    if (uaeLandmarks.some(landmark => lowerQuery.includes(landmark))) {
      return true;
    }

    // Check for UAE-specific companies and services
    const uaeCompanies = [
      'emirates airline', 'etihad', 'flydubai', 'dubai metro', 'nol card',
      'mohammed bin rashid', 'sheikh mohammed', 'uae president',
      'abu dhabi crown prince', 'dubai ruler'
    ];
    if (uaeCompanies.some(company => lowerQuery.includes(company))) {
      return true;
    }

    // Check for UAE-specific cultural/events
    const uaeCulture = [
      'uae culture', 'uae national day', 'uae flag', 'ramadan uae', 'eid uae'
    ];
    if (uaeCulture.some(culture => lowerQuery.includes(culture))) {
      return true;
    }

    // Only return true if we have strong UAE context
    // This prevents false positives from generic words
    return false;
  }

  /**
   * Check if a query is weather-related
   */
  private isWeatherQuery(query: string): boolean {
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy', 'hot', 'cold', 'climate'];
    const lowerQuery = query.toLowerCase();
    return weatherKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Search for weather information
   */
  private async searchWeather(query: string): Promise<SearchResult[]> {
    try {
      // Extract city name from query
      const cities = ['dubai', 'abu dhabi', 'sharjah', 'ajman', 'fujairah', 'ras al khaimah', 'umm al quwain'];
      const lowerQuery = query.toLowerCase();
      const city = cities.find(c => lowerQuery.includes(c)) || 'dubai';

      // Use OpenWeatherMap API (free tier)
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},ae&appid=demo&units=metric`; // Replace with real API key

      const response = await fetch(weatherUrl);
      if (!response.ok) {
        return await this.getWeatherAlternatives(city);
      }

      const data = await response.json();

      return [{
        title: `Current Weather in ${city.charAt(0).toUpperCase() + city.slice(1)}, UAE`,
        link: `https://openweathermap.org/city/${data.id}`,
        snippet: `Temperature: ${Math.round(data.main.temp)}°C, ${data.weather[0].description}. Humidity: ${data.main.humidity}%, Wind: ${data.wind.speed} m/s.`,
        displayLink: 'openweathermap.org'
      }];
    } catch (error) {
      console.warn('Weather API failed:', error);
      return await this.getWeatherAlternatives('dubai');
    }
  }

  /**
   * Get weather alternatives when API fails
   */
  private async getWeatherAlternatives(city: string): Promise<SearchResult[]> {
    return [
      {
        title: `Weather in ${city.charAt(0).toUpperCase() + city.slice(1)} - UAE`,
        link: `https://www.accuweather.com/en/ae/${city}/241830/weather-forecast/241830`,
        snippet: 'Check current weather conditions, hourly forecast, and 10-day outlook for UAE cities.',
        displayLink: 'accuweather.com'
      },
      {
        title: 'UAE Weather Forecast - National Center of Meteorology',
        link: 'https://www.ncm.ae/en/weather-forecast.html',
        snippet: 'Official UAE weather forecasts from the National Center of Meteorology and Seismology.',
        displayLink: 'ncm.ae'
      }
    ];
  }

  /**
   * Search the web for UAE-related information
   */
  async searchWeb(query: string): Promise<WebSearchResponse> {
    const enhancedQuery = this.enhanceUAEQuery(query);

    // Special handling for weather queries
    if (this.isWeatherQuery(query)) {
      const weatherResults = await this.searchWeather(enhancedQuery);
      if (weatherResults.length > 0) {
        return {
          query: enhancedQuery,
          results: weatherResults,
          searchTime: Date.now(),
          totalResults: weatherResults.length
        };
      }
    }

    try {
      // Try multiple sources for comprehensive results
      const [wikiResults, newsResults] = await Promise.allSettled([
        this.searchWikipedia(enhancedQuery),
        this.searchNewsAPI(enhancedQuery)
      ]);

      const allResults: SearchResult[] = [];

      // Add Wikipedia results
      if (wikiResults.status === 'fulfilled') {
        allResults.push(...wikiResults.value);
      }

      // Add news results
      if (newsResults.status === 'fulfilled') {
        allResults.push(...newsResults.value);
      }

      // If no results from APIs, use mock data
      if (allResults.length === 0) {
        allResults.push(...this.getMockResults());
      }

      return {
        query: enhancedQuery,
        results: allResults.slice(0, 8), // Limit to 8 results
        searchTime: Date.now(),
        totalResults: allResults.length
      };
    } catch (error) {
      console.error('All search APIs failed:', error);
      // Return mock results as final fallback
      const mockResults = this.getMockResults();
      return {
        query: enhancedQuery,
        results: mockResults,
        searchTime: Date.now(),
        totalResults: mockResults.length
      };
    }
  }

  /**
   * Search the web for any query (general web search)
   */
  async searchWebGeneral(query: string): Promise<WebSearchResponse> {
    const enhancedQuery = query; // Don't enhance for general queries

    try {
      // Try multiple sources for comprehensive results
      const [wikiResults, newsResults] = await Promise.allSettled([
        this.searchWikipediaGeneral(enhancedQuery),
        this.searchNewsAPIGeneral(enhancedQuery)
      ]);

      const allResults: SearchResult[] = [];

      // Add Wikipedia results
      if (wikiResults.status === 'fulfilled') {
        allResults.push(...wikiResults.value);
      }

      // Add news results
      if (newsResults.status === 'fulfilled') {
        allResults.push(...newsResults.value);
      }

      // If no results from APIs, use mock data
      if (allResults.length === 0) {
        allResults.push(...this.getGeneralMockResults());
      }

      return {
        query: enhancedQuery,
        results: allResults.slice(0, 8), // Limit to 8 results
        searchTime: Date.now(),
        totalResults: allResults.length
      };
    } catch (error) {
      console.error('General web search failed:', error);
      // Return mock results as final fallback
      const mockResults = this.getGeneralMockResults();
      return {
        query: enhancedQuery,
        results: mockResults,
        searchTime: Date.now(),
        totalResults: mockResults.length
      };
    }
  }

  /**
   * Enhance query with UAE-specific context
   */
  private enhanceUAEQuery(query: string): string {
    const lowerQuery = query.toLowerCase();

    // If query already mentions UAE or specific locations, don't modify
    if (this.isUAERelated(query)) {
      return query;
    }

    // Only enhance very specific queries that are likely UAE-related
    const enhancementRules = [
      // Weather queries - only if they mention UAE cities
      { pattern: /\b(weather|temperature|forecast)\b.*\b(dubai|abu dhabi|sharjah|ajman|fujairah|ras al khaimah|umm al quwain)\b/i, enhancement: '$1 in $2 UAE' },
      // Transport queries - only if they mention UAE cities
      { pattern: /\b(metro|bus|taxi|transport)\b.*\b(dubai|abu dhabi|sharjah)\b/i, enhancement: '$1 in $2 UAE' },
      // Mall/restaurant queries - only if they mention UAE cities
      { pattern: /\b(mall|restaurant|hotel|beach)\b.*\b(dubai|abu dhabi|sharjah)\b/i, enhancement: '$1 in $2 UAE' }
    ];

    for (const rule of enhancementRules) {
      if (rule.pattern.test(query)) {
        return query.replace(rule.pattern, rule.enhancement);
      }
    }

    // For general queries that might be UAE-related but don't have location context,
    // only enhance if they contain UAE-specific terms
    const uaeContextWords = ['emirates', 'gulf', 'arabian', 'burj', 'palm', 'desert safari'];
    const hasUAEContext = uaeContextWords.some(word => lowerQuery.includes(word));

    if (hasUAEContext) {
      return query + ' UAE';
    }

    return query;
  }

  /**
   * Search Wikipedia for UAE-related information
   */
  private async searchWikipedia(query: string): Promise<SearchResult[]> {
    try {
      const wikiQuery = query.replace(/uae|united arab emirates/gi, '').trim() + ' UAE';
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery.replace(/\s+/g, '_'))}`;

      const response = await fetch(url);
      if (!response.ok) {
        // Try a search instead of direct page lookup
        return await this.searchWikipediaWithSearch(query);
      }

      const data = await response.json();

      return [{
        title: data.title || 'Wikipedia Article',
        link: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiQuery.replace(/\s+/g, '_'))}`,
        snippet: data.extract || 'Information from Wikipedia about UAE topics.',
        displayLink: 'en.wikipedia.org'
      }];
    } catch (error) {
      console.warn('Wikipedia search failed:', error);
      return [];
    }
  }

  /**
   * Search Wikipedia using search API
   */
  private async searchWikipediaWithSearch(query: string): Promise<SearchResult[]> {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' UAE')}&format=json&origin=*`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      return (data.query?.search || []).slice(0, 3).map((result: any) => ({
        title: result.title,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/\s+/g, '_'))}`,
        snippet: result.snippet.replace(/<[^>]*>/g, '') + '...',
        displayLink: 'en.wikipedia.org'
      }));
    } catch (error) {
      console.warn('Wikipedia search API failed:', error);
      return [];
    }
  }

  /**
   * Search NewsAPI for UAE-related news
   */
  private async searchNewsAPI(query: string): Promise<SearchResult[]> {
    try {
      // Using a free news API - NewsAPI.org with a demo key (limited but works)
      const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query + ' UAE')}&language=en&sortBy=publishedAt&pageSize=3&apiKey=demo`; // Replace with real API key for production

      const response = await fetch(newsUrl);
      if (!response.ok) {
        // Fallback to alternative news sources
        return await this.searchAlternativeNews(query);
      }

      const data = await response.json();

      return (data.articles || []).slice(0, 2).map((article: any) => ({
        title: article.title,
        link: article.url,
        snippet: article.description || 'Latest news about UAE topics.',
        displayLink: new URL(article.url).hostname
      }));
    } catch (error) {
      console.warn('NewsAPI search failed, trying alternatives:', error);
      return await this.searchAlternativeNews(query);
    }
  }

  /**
   * Alternative news search using free APIs
   */
  private async searchAlternativeNews(query: string): Promise<SearchResult[]> {
    try {
      // Return curated UAE news sources with search queries
      return [
        {
          title: 'Gulf News - Latest UAE News',
          link: `https://gulfnews.com/search?q=${encodeURIComponent(query)}`,
          snippet: 'Comprehensive coverage of UAE news, business, sports, and lifestyle from Gulf News.',
          displayLink: 'gulfnews.com'
        },
        {
          title: 'Khaleej Times - UAE News',
          link: `https://www.khaleejtimes.com/search/${encodeURIComponent(query)}`,
          snippet: 'Breaking news and updates from the UAE and Middle East region.',
          displayLink: 'khaleejtimes.com'
        },
        {
          title: 'The National - UAE News',
          link: `https://www.thenationalnews.com/search?q=${encodeURIComponent(query)}`,
          snippet: 'In-depth reporting on UAE news, politics, business, and culture.',
          displayLink: 'thenationalnews.com'
        }
      ];
    } catch (error) {
      console.warn('Alternative news search failed:', error);
      return [];
    }
  }

  /**
   * Return mock results for development/demo purposes
   */
  private getMockResults(): SearchResult[] {
    return [
      {
        title: 'UAE Information - Official Government Portal',
        link: 'https://www.dubaipolice.gov.ae',
        snippet: 'Official information about UAE services, tourism, and government services. Find the latest updates on UAE attractions, events, and essential services.',
        displayLink: 'dubaipolice.gov.ae'
      },
      {
        title: 'Dubai Tourism - Visit Dubai Official Website',
        link: 'https://www.visitdubai.com',
        snippet: 'Discover Dubai\'s top attractions, events, and experiences. Plan your perfect trip to the UAE with official tourism information.',
        displayLink: 'visitdubai.com'
      },
      {
        title: 'UAE Government Services - Smart Dubai',
        link: 'https://www.smartdubai.ae',
        snippet: 'Access UAE government services online. Find information about transportation, healthcare, education, and business in the UAE.',
        displayLink: 'smartdubai.ae'
      }
    ];
  }

  /**
   * Search Wikipedia for general information
   */
  private async searchWikipediaGeneral(query: string): Promise<SearchResult[]> {
    try {
      const wikiQuery = query.replace(/\s+/g, '_');
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`;

      const response = await fetch(url);
      if (!response.ok) {
        // Try a search instead of direct page lookup
        return await this.searchWikipediaWithSearchGeneral(query);
      }

      const data = await response.json();

      return [{
        title: data.title || 'Wikipedia Article',
        link: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiQuery)}`,
        snippet: data.extract || 'Information from Wikipedia.',
        displayLink: 'en.wikipedia.org'
      }];
    } catch (error) {
      console.warn('General Wikipedia search failed:', error);
      return [];
    }
  }

  /**
   * Search Wikipedia using search API for general queries
   */
  private async searchWikipediaWithSearchGeneral(query: string): Promise<SearchResult[]> {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      return (data.query?.search || []).slice(0, 3).map((result: any) => ({
        title: result.title,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/\s+/g, '_'))}`,
        snippet: result.snippet.replace(/<[^>]*>/g, '') + '...',
        displayLink: 'en.wikipedia.org'
      }));
    } catch (error) {
      console.warn('General Wikipedia search API failed:', error);
      return [];
    }
  }

  /**
   * Search NewsAPI for general news
   */
  private async searchNewsAPIGeneral(query: string): Promise<SearchResult[]> {
    try {
      // Using a free news API - NewsAPI.org with a demo key (limited but works)
      const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=3&apiKey=demo`; // Replace with real API key for production

      const response = await fetch(newsUrl);
      if (!response.ok) {
        // Fallback to alternative news sources
        return await this.searchGeneralNews(query);
      }

      const data = await response.json();

      return (data.articles || []).slice(0, 2).map((article: any) => ({
        title: article.title,
        link: article.url,
        snippet: article.description || 'Latest news about this topic.',
        displayLink: new URL(article.url).hostname
      }));
    } catch (error) {
      console.warn('General NewsAPI search failed, trying alternatives:', error);
      return await this.searchGeneralNews(query);
    }
  }

  /**
   * Alternative general news search
   */
  private async searchGeneralNews(query: string): Promise<SearchResult[]> {
    try {
      // Return general search results from major news sources
      return [
        {
          title: `Search results for "${query}"`,
          link: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: 'Find comprehensive information and latest updates on this topic from trusted sources worldwide.',
          displayLink: 'google.com'
        },
        {
          title: 'BBC News - Latest Updates',
          link: `https://www.bbc.co.uk/search?q=${encodeURIComponent(query)}`,
          snippet: 'Breaking news and in-depth coverage from BBC News.',
          displayLink: 'bbc.co.uk'
        },
        {
          title: 'Reuters - Global News',
          link: `https://www.reuters.com/search/?query=${encodeURIComponent(query)}`,
          snippet: 'Fact-based journalism and global news coverage.',
          displayLink: 'reuters.com'
        }
      ];
    } catch (error) {
      console.warn('General news search failed:', error);
      return [];
    }
  }

  /**
   * Return general mock results for development/demo purposes
   */
  private getGeneralMockResults(): SearchResult[] {
    return [
      {
        title: 'Search Results',
        link: 'https://www.google.com',
        snippet: 'Find comprehensive information about your query from trusted sources worldwide.',
        displayLink: 'google.com'
      },
      {
        title: 'Wikipedia - Free Encyclopedia',
        link: 'https://en.wikipedia.org',
        snippet: 'Access free knowledge and detailed information about various topics.',
        displayLink: 'wikipedia.org'
      },
      {
        title: 'BBC News - Latest Updates',
        link: 'https://www.bbc.co.uk/news',
        snippet: 'Stay informed with breaking news and in-depth coverage from around the world.',
        displayLink: 'bbc.co.uk'
      }
    ];
  }

  /**
   * Format search results for chatbot response
   */
  formatSearchResults(response: WebSearchResponse): string {
    if (response.results.length === 0) {
      return 'I couldn\'t find specific information about that topic. Could you please rephrase your question or ask about a different UAE-related topic?';
    }

    let formattedResponse = `🔍 **Web Search Results for "${response.query}"**\n\n`;

    response.results.forEach((result, index) => {
      formattedResponse += `**${index + 1}. ${result.title}**\n`;
      formattedResponse += `${result.snippet}\n`;
      formattedResponse += `🔗 ${result.link}\n\n`;
    });

    formattedResponse += `---\n*Results from web search. For the most current information, please visit the official sources above.*`;

    return formattedResponse;
  }
}