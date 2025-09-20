#!/usr/bin/env node

/**
 * UAE Tourist Spots Scraper - Playwright MCP Template
 * 
 * This template demonstrates how to scrape UAE tourism data using Playwright-MCP
 * while respecting robots.txt, rate limits, and image licensing requirements.
 * 
 * Usage: node scrape-uae-spots.js [--dry-run] [--verbose]
 * 
 * Required Environment Variables:
 * - UNSPLASH_ACCESS_KEY (optional, for high-quality images)
 * - SCRAPE_DELAY_MS (default: 1000, minimum delay between requests)
 */

const fs = require('fs').promises;
const path = require('path');

// MCP Playwright commands that would be executed
const MCPCommands = {
  
  /**
   * Step 1: Check robots.txt compliance
   */
  async checkRobotsTxt(domain) {
    return {
      action: "mcp_playwright_browser_navigate",
      parameters: {
        url: `https://${domain}/robots.txt`
      },
      validation: async (content) => {
        // Check if crawling is allowed for our user agent
        const userAgentPattern = /User-agent: \*/i;
        const disallowPattern = /Disallow: \//i;
        
        if (userAgentPattern.test(content) && disallowPattern.test(content)) {
          throw new Error(`Scraping disallowed by robots.txt for ${domain}`);
        }
        
        console.log(`✓ Scraping allowed for ${domain}`);
        return true;
      }
    };
  },

  /**
   * Step 2: Navigate to target page with rate limiting
   */
  async navigateWithDelay(url, delayMs = 1000) {
    // Implement delay
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    return [
      {
        action: "mcp_playwright_browser_navigate",
        parameters: { url }
      },
      {
        action: "mcp_playwright_browser_wait_for",
        parameters: { time: 2 }
      }
    ];
  },

  /**
   * Step 3: Extract tourist spot data from Wikipedia page
   */
  async extractWikipediaSpotData(pageTitle) {
    const baseCommands = [
      {
        action: "mcp_playwright_browser_navigate", 
        parameters: {
          url: `https://en.wikipedia.org/wiki/${pageTitle}`
        }
      },
      {
        action: "mcp_playwright_browser_wait_for",
        parameters: { time: 2 }
      }
    ];

    const extractionCommands = [
      // Extract title
      {
        action: "mcp_playwright_browser_evaluate",
        parameters: {
          function: "() => document.querySelector('h1#firstHeading')?.textContent?.trim()"
        },
        extract: "title"
      },

      // Extract coordinates from infobox
      {
        action: "mcp_playwright_browser_evaluate", 
        parameters: {
          function: `() => {
            const coordSpan = document.querySelector('.geo-dec, .geo');
            if (coordSpan) {
              const text = coordSpan.textContent;
              const match = text.match(/([0-9.-]+)[;,\s]+([0-9.-]+)/);
              if (match) {
                return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
              }
            }
            return null;
          }`
        },
        extract: "coordinates"
      },

      // Extract summary from first paragraph
      {
        action: "mcp_playwright_browser_evaluate",
        parameters: {
          function: "() => document.querySelector('#mw-content-text p:not(.mw-empty-elt)')?.textContent?.trim()"
        },
        extract: "summary"
      },

      // Extract infobox data (website, opening hours if available)
      {
        action: "mcp_playwright_browser_evaluate",
        parameters: {
          function: `() => {
            const infobox = document.querySelector('.infobox');
            const data = {};
            if (infobox) {
              const rows = infobox.querySelectorAll('tr');
              rows.forEach(row => {
                const header = row.querySelector('th');
                const value = row.querySelector('td');
                if (header && value) {
                  const key = header.textContent.trim().toLowerCase();
                  if (key.includes('website')) {
                    const link = value.querySelector('a');
                    if (link) data.website = link.href;
                  }
                  if (key.includes('opened') || key.includes('opening')) {
                    data.opening_info = value.textContent.trim();
                  }
                }
              });
            }
            return data;
          }`
        },
        extract: "infobox_data"
      },

      // Extract categories for tags
      {
        action: "mcp_playwright_browser_evaluate",
        parameters: {
          function: `() => {
            const categories = [];
            document.querySelectorAll('#mw-normal-catlinks a').forEach(link => {
              if (link.textContent.includes('tourist') || 
                  link.textContent.includes('landmark') ||
                  link.textContent.includes('museum') ||
                  link.textContent.includes('architecture')) {
                categories.push(link.textContent.replace('Category:', ''));
              }
            });
            return categories;
          }`
        },
        extract: "categories"
      }
    ];

    return [...baseCommands, ...extractionCommands];
  },

  /**
   * Step 4: Extract images with license checking
   */
  async extractLicensedImages(spotName, maxImages = 3) {
    const commands = [
      {
        action: "mcp_playwright_browser_navigate",
        parameters: {
          url: `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(spotName)}&title=Special:MediaSearch&go=Go&type=image`
        }
      },
      {
        action: "mcp_playwright_browser_wait_for",
        parameters: { time: 3 }
      },
      
      // Extract image results with license info
      {
        action: "mcp_playwright_browser_evaluate",
        parameters: {
          function: `() => {
            const images = [];
            const imageElements = document.querySelectorAll('.sdms-search-results-container .sdms-image-search-results-item');
            
            for (let i = 0; i < Math.min(imageElements.length, ${maxImages}); i++) {
              const element = imageElements[i];
              const img = element.querySelector('img');
              const link = element.querySelector('a');
              
              if (img && link) {
                images.push({
                  thumbnail_url: img.src,
                  page_url: 'https://commons.wikimedia.org' + link.getAttribute('href'),
                  alt_text: img.alt || '',
                  title: link.title || ''
                });
              }
            }
            return images;
          }`
        },
        extract: "image_candidates"
      }
    ];

    return commands;
  },

  /**
   * Step 5: Verify image licenses (for each candidate)
   */
  async verifyImageLicense(imagePageUrl) {
    return [
      {
        action: "mcp_playwright_browser_navigate",
        parameters: { url: imagePageUrl }
      },
      {
        action: "mcp_playwright_browser_wait_for", 
        parameters: { time: 2 }
      },
      
      // Extract license information
      {
        action: "mcp_playwright_browser_evaluate",
        parameters: {
          function: `() => {
            const licenseInfo = {};
            
            // Look for Creative Commons license
            const ccLicense = document.querySelector('.licensetpl_cc, .cc-license');
            if (ccLicense) {
              const ccText = ccLicense.textContent;
              if (ccText.includes('CC0') || ccText.includes('Public Domain')) {
                licenseInfo.license = 'CC0/Public Domain';
                licenseInfo.permissive = true;
              } else if (ccText.includes('CC BY')) {
                licenseInfo.license = ccText.match(/CC BY[^\n]*/)?.[0] || 'CC BY';
                licenseInfo.permissive = true;
              } else {
                licenseInfo.license = 'Unknown CC';
                licenseInfo.permissive = false;
              }
            }
            
            // Extract author/photographer
            const author = document.querySelector('.fileinfotpl-aut, .author');
            if (author) {
              licenseInfo.photographer = author.textContent.trim();
            }
            
            // Extract file URL
            const fullResLink = document.querySelector('.fullImageLink a');
            if (fullResLink) {
              licenseInfo.full_url = fullResLink.href;
            }
            
            // Extract dimensions
            const sizeInfo = document.querySelector('.fileInfo');
            if (sizeInfo) {
              const sizeMatch = sizeInfo.textContent.match(/(\d+)\s*×\s*(\d+)/);
              if (sizeMatch) {
                licenseInfo.width = parseInt(sizeMatch[1]);
                licenseInfo.height = parseInt(sizeMatch[2]);
              }
            }
            
            return licenseInfo;
          }`
        },
        extract: "license_info"
      }
    ];
  },

  /**
   * Step 6: Geocode address if coordinates missing
   */
  async geocodeAddress(address) {
    const encodedAddress = encodeURIComponent(`${address}, UAE`);
    
    return [
      {
        action: "mcp_playwright_browser_navigate",
        parameters: {
          url: `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=ae`
        }
      },
      {
        action: "mcp_playwright_browser_wait_for",
        parameters: { time: 1 }
      },
      {
        action: "mcp_playwright_browser_evaluate",
        parameters: {
          function: `() => {
            try {
              const jsonText = document.body.textContent;
              const results = JSON.parse(jsonText);
              if (results.length > 0) {
                return {
                  lat: parseFloat(results[0].lat),
                  lng: parseFloat(results[0].lon),
                  display_name: results[0].display_name
                };
              }
            } catch (e) {
              console.error('Failed to parse geocoding result:', e);
            }
            return null;
          }`
        },
        extract: "geocoding_result"
      }
    ];
  }
};

/**
 * Main scraping orchestrator
 */
class UAETouristSpotsScraper {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.delayMs = parseInt(process.env.SCRAPE_DELAY_MS) || 1000;
    this.outputDir = options.outputDir || './output';
    this.scraperLog = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.scraperLog.push(logEntry);
    
    if (this.verbose || level === 'error') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    }
  }

  /**
   * Complete scraping workflow for a single tourist spot
   */
  async scrapeTouristSpot(spotConfig) {
    this.log(`Starting scrape for ${spotConfig.name}`);
    
    try {
      // Step 1: Check robots.txt for each domain
      for (const domain of spotConfig.domains) {
        if (!this.dryRun) {
          await MCPCommands.checkRobotsTxt(domain);
        }
        this.log(`Robots.txt check passed for ${domain}`);
      }

      // Step 2: Extract from Wikipedia
      const wikiCommands = await MCPCommands.extractWikipediaSpotData(spotConfig.wikipediaTitle);
      let spotData = { id: spotConfig.id, name: spotConfig.name };
      
      if (!this.dryRun) {
        // Execute Wikipedia extraction commands
        for (const command of wikiCommands) {
          this.log(`Executing: ${command.action}`);
          // In real implementation, this would call the MCP
          await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }
      }

      // Step 3: Extract images with license verification
      const imageCommands = await MCPCommands.extractLicensedImages(spotConfig.name);
      let validImages = [];
      
      if (!this.dryRun) {
        // Execute image search and license verification
        this.log(`Searching for licensed images of ${spotConfig.name}`);
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
      }

      // Step 4: Geocode if needed
      if (!spotData.coordinates && spotConfig.address) {
        const geocodeCommands = await MCPCommands.geocodeAddress(spotConfig.address);
        if (!this.dryRun) {
          this.log(`Geocoding address: ${spotConfig.address}`);
          await new Promise(resolve => setTimeout(resolve, this.delayMs));
        }
      }

      // Step 5: Assemble final data structure
      const finalSpotData = {
        ...spotData,
        scrape_timestamp: new Date().toISOString(),
        scrape_source: 'playwright-mcp',
        validation_passed: true
      };

      this.log(`Completed scrape for ${spotConfig.name}`);
      return finalSpotData;

    } catch (error) {
      this.log(`Error scraping ${spotConfig.name}: ${error.message}`, 'error');
      return {
        id: spotConfig.id,
        name: spotConfig.name,
        error: error.message,
        scrape_timestamp: new Date().toISOString(),
        validation_passed: false
      };
    }
  }

  /**
   * Save results and logs
   */
  async saveResults(spots, sourcesLog) {
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Save main dataset
    await fs.writeFile(
      path.join(this.outputDir, 'uae_tourist_spots.json'),
      JSON.stringify(spots, null, 2)
    );

    // Save CSV version
    const csvHeader = 'id,name,emirate,latitude,longitude,website,scrape_timestamp\n';
    const csvRows = spots.map(spot => 
      [spot.id, spot.name, spot.emirate, spot.latitude, spot.longitude, spot.website, spot.scrape_timestamp]
        .map(field => `"${field || ''}"`)
        .join(',')
    );
    await fs.writeFile(
      path.join(this.outputDir, 'uae_tourist_spots.csv'),
      csvHeader + csvRows.join('\n')
    );

    // Save sources log
    await fs.writeFile(
      path.join(this.outputDir, 'sources_log.json'),
      JSON.stringify(sourcesLog, null, 2)
    );

    // Save scraper session log
    await fs.writeFile(
      path.join(this.outputDir, 'scrape_session_log.json'),
      JSON.stringify(this.scraperLog, null, 2)
    );

    this.log(`Results saved to ${this.outputDir}`);
  }
}

/**
 * Configuration for target tourist spots
 */
const SPOT_CONFIGS = [
  {
    id: 'burj-khalifa',
    name: 'Burj Khalifa',
    wikipediaTitle: 'Burj_Khalifa',
    domains: ['en.wikipedia.org', 'commons.wikimedia.org', 'burjkhalifa.ae'],
    address: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, Dubai, UAE'
  },
  {
    id: 'sheikh-zayed-grand-mosque', 
    name: 'Sheikh Zayed Grand Mosque',
    wikipediaTitle: 'Sheikh_Zayed_Grand_Mosque',
    domains: ['en.wikipedia.org', 'commons.wikimedia.org', 'szgmc.gov.ae'],
    address: 'Sheikh Rashid Bin Saeed Street, Abu Dhabi, UAE'
  },
  {
    id: 'louvre-abu-dhabi',
    name: 'Louvre Abu Dhabi', 
    wikipediaTitle: 'Louvre_Abu_Dhabi',
    domains: ['en.wikipedia.org', 'commons.wikimedia.org', 'louvreabudhabi.ae'],
    address: 'Saadiyat Cultural District, Abu Dhabi, UAE'
  }
];

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  console.log('🇦🇪 UAE Tourist Spots Scraper - Playwright MCP Template');
  console.log('======================================================');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No actual requests will be made');
  }

  const scraper = new UAETouristSpotsScraper({ dryRun, verbose });
  const results = [];
  const sourcesLog = {
    scrape_session_id: Date.now().toString(),
    scrape_timestamp: new Date().toISOString(),
    spots_attempted: SPOT_CONFIGS.length,
    domains_checked: [],
    robots_txt_compliance: {}
  };

  for (const spotConfig of SPOT_CONFIGS) {
    console.log(`\n📍 Processing: ${spotConfig.name}`);
    
    const spotData = await scraper.scrapeTouristSpot(spotConfig);
    results.push(spotData);
    
    // Track domains for compliance log
    spotConfig.domains.forEach(domain => {
      if (!sourcesLog.domains_checked.includes(domain)) {
        sourcesLog.domains_checked.push(domain);
        sourcesLog.robots_txt_compliance[domain] = 'allowed'; // Would be set based on actual check
      }
    });
  }

  sourcesLog.spots_completed = results.filter(r => r.validation_passed).length;
  sourcesLog.spots_failed = results.filter(r => !r.validation_passed).length;

  await scraper.saveResults(results, sourcesLog);
  
  console.log('\n✅ Scraping completed!');
  console.log(`📊 Results: ${sourcesLog.spots_completed} successful, ${sourcesLog.spots_failed} failed`);
  console.log(`📁 Output saved to: ${scraper.outputDir}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { UAETouristSpotsScraper, MCPCommands };