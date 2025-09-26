import { TestBed } from '@angular/core/testing';
import { WebSearchService } from './web-search.service';

describe('WebSearchService', () => {
  let service: WebSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect UAE-related queries correctly', () => {
    // Should detect UAE queries
    expect(service.isUAERelated('What is the weather in Dubai?')).toBeTruthy();
    expect(service.isUAERelated('Tell me about Burj Khalifa')).toBeTruthy();
    expect(service.isUAERelated('How to use Dubai Metro?')).toBeTruthy();
    expect(service.isUAERelated('UAE culture and traditions')).toBeTruthy();
    expect(service.isUAERelated('Emirates airline flights')).toBeTruthy();
    expect(service.isUAERelated('Desert safari in Dubai')).toBeTruthy();

    // Should NOT detect non-UAE queries (these were causing random answers)
    expect(service.isUAERelated('What is the weather in London?')).toBeFalsy();
    expect(service.isUAERelated('Tell me about Islamic art')).toBeFalsy();
    expect(service.isUAERelated('How to use New York subway?')).toBeFalsy();
    expect(service.isUAERelated('What is a falcon?')).toBeFalsy();
    expect(service.isUAERelated('I want to see camels')).toBeFalsy();
    expect(service.isUAERelated('What is halal food?')).toBeFalsy();
    expect(service.isUAERelated('Tell me about desert animals')).toBeFalsy();
    expect(service.isUAERelated('What is a mosque?')).toBeFalsy();

    // Should NOT detect short queries or greetings
    expect(service.isUAERelated('hi')).toBeFalsy();
    expect(service.isUAERelated('hello')).toBeFalsy();
    expect(service.isUAERelated('thanks')).toBeFalsy();
    expect(service.isUAERelated('bye')).toBeFalsy();
    expect(service.isUAERelated('weather')).toBeFalsy(); // Single word
    expect(service.isUAERelated('dubai')).toBeFalsy(); // Single word
  });

  it('should enhance queries with UAE context', () => {
    // UAE-related queries should not be modified
    expect(service['enhanceUAEQuery']('Dubai weather')).toBe('Dubai weather');

    // General queries should get UAE context
    expect(service['enhanceUAEQuery']('weather')).toBe('weather UAE');
    expect(service['enhanceUAEQuery']('metro')).toBe('metro UAE');
    expect(service['enhanceUAEQuery']('beach')).toBe('beach UAE');
  });

  it('should return mock results when APIs are not configured', async () => {
    const result = await service.searchWeb('Dubai attractions');

    expect(result).toBeDefined();
    expect(result.query).toBe('Dubai attractions');
    expect(result.results).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].title).toBeDefined();
    expect(result.results[0].link).toBeDefined();
    expect(result.results[0].snippet).toBeDefined();
  });

  it('should detect weather queries', () => {
    expect(service['isWeatherQuery']('What is the weather in Dubai?')).toBeTruthy();
    expect(service['isWeatherQuery']('Temperature in Abu Dhabi')).toBeTruthy();
    expect(service['isWeatherQuery']('Is it raining in UAE?')).toBeTruthy();
    expect(service['isWeatherQuery']('How hot is Dubai today?')).toBeTruthy();

    expect(service['isWeatherQuery']('What are the best restaurants in Dubai?')).toBeFalsy();
    expect(service['isWeatherQuery']('Tell me about Burj Khalifa')).toBeFalsy();
  });

  it('should format search results correctly', () => {
    const mockResponse = {
      query: 'Dubai weather',
      results: [
        {
          title: 'Weather in Dubai',
          link: 'https://example.com',
          snippet: 'Current weather information for Dubai',
          displayLink: 'example.com'
        }
      ],
      searchTime: Date.now(),
      totalResults: 1
    };

    const formatted = service.formatSearchResults(mockResponse);

    expect(formatted).toContain('🔍 **Web Search Results for "Dubai weather"**');
    expect(formatted).toContain('Weather in Dubai');
    expect(formatted).toContain('https://example.com');
    expect(formatted).toContain('Current weather information for Dubai');
  });
});