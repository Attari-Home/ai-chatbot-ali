#!/usr/bin/env node

/**
 * UAE Tourist Spots Data Verification Script
 * 
 * Validates the scraped data for completeness, accuracy, and compliance.
 * 
 * Usage: node verification_script.js [--check-images] [--check-urls] [--verbose]
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { URL } = require('url');

class DataVerifier {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.checkImages = options.checkImages || false;
    this.checkUrls = options.checkUrls || false;
    this.dataDir = options.dataDir || './';
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalSpots: 0,
      validSpots: 0,
      totalImages: 0,
      validImages: 0,
      urlsChecked: 0,
      urlsWorking: 0
    };
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    }
  }

  addError(message, context = {}) {
    this.errors.push({ message, context, timestamp: new Date().toISOString() });
    this.log(message, 'error');
  }

  addWarning(message, context = {}) {
    this.warnings.push({ message, context, timestamp: new Date().toISOString() });
    this.log(message, 'warning');
  }

  /**
   * Load and parse JSON data files
   */
  async loadData() {
    try {
      // Load main dataset
      const spotsData = await fs.readFile(
        path.join(this.dataDir, 'uae_tourist_spots.json'),
        'utf8'
      );
      this.spots = JSON.parse(spotsData);

      // Load images metadata
      const imagesData = await fs.readFile(
        path.join(this.dataDir, 'images_metadata.json'),
        'utf8'
      );
      this.images = JSON.parse(imagesData);

      // Load sources log
      const sourcesData = await fs.readFile(
        path.join(this.dataDir, 'sources_log.json'),
        'utf8'
      );
      this.sources = JSON.parse(sourcesData);

      this.stats.totalSpots = this.spots.length;
      this.stats.totalImages = this.images.images?.length || 0;

      this.log(`Loaded ${this.stats.totalSpots} spots and ${this.stats.totalImages} images`);
      return true;

    } catch (error) {
      this.addError(`Failed to load data files: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate required fields for each tourist spot
   */
  validateSpotFields() {
    const requiredFields = ['id', 'name', 'short_summary', 'long_description', 
                          'emirate', 'latitude', 'longitude', 'tags'];
    const recommendedFields = ['website', 'opening_hours', 'entry_fee', 'images'];

    this.log('Validating spot fields...');

    for (const spot of this.spots) {
      let spotValid = true;

      // Check required fields
      for (const field of requiredFields) {
        if (!spot[field] || (Array.isArray(spot[field]) && spot[field].length === 0)) {
          this.addError(`Missing required field '${field}'`, { spot_id: spot.id });
          spotValid = false;
        }
      }

      // Check field types and formats
      if (spot.latitude && (typeof spot.latitude !== 'number' || 
          spot.latitude < 22.0 || spot.latitude > 26.5)) {
        this.addError(`Invalid latitude for UAE: ${spot.latitude}`, { spot_id: spot.id });
        spotValid = false;
      }

      if (spot.longitude && (typeof spot.longitude !== 'number' || 
          spot.longitude < 51.0 || spot.longitude > 57.0)) {
        this.addError(`Invalid longitude for UAE: ${spot.longitude}`, { spot_id: spot.id });
        spotValid = false;
      }

      // Check string lengths
      if (spot.short_summary && spot.short_summary.length > 300) {
        this.addWarning(`Short summary too long (${spot.short_summary.length} chars)`, 
                       { spot_id: spot.id });
      }

      if (spot.long_description && spot.long_description.length < 400) {
        this.addWarning(`Long description too short (${spot.long_description.length} chars)`, 
                       { spot_id: spot.id });
      }

      // Check recommended fields
      for (const field of recommendedFields) {
        if (!spot[field]) {
          this.addWarning(`Missing recommended field '${field}'`, { spot_id: spot.id });
        }
      }

      // Validate Emirates
      const validEmirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];
      if (spot.emirate && !validEmirates.includes(spot.emirate)) {
        this.addError(`Invalid emirate: ${spot.emirate}`, { spot_id: spot.id });
        spotValid = false;
      }

      if (spotValid) {
        this.stats.validSpots++;
      }
    }
  }

  /**
   * Validate image metadata and licensing
   */
  validateImages() {
    this.log('Validating image data...');

    if (!this.images.images) {
      this.addError('No images data found');
      return;
    }

    const validLicenses = ['CC0', 'CC BY', 'CC BY 2.0', 'CC BY 3.0', 'CC BY 4.0', 
                          'CC BY-SA 2.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'Public Domain'];

    for (const image of this.images.images) {
      let imageValid = true;

      // Required fields
      const requiredImageFields = ['id', 'source_url', 'license', 'photographer', 'alt_text'];
      for (const field of requiredImageFields) {
        if (!image[field]) {
          this.addError(`Image missing required field '${field}'`, { image_id: image.id });
          imageValid = false;
        }
      }

      // License validation
      if (image.license && !validLicenses.some(valid => image.license.includes(valid))) {
        this.addError(`Invalid or non-permissive license: ${image.license}`, 
                     { image_id: image.id });
        imageValid = false;
      }

      // URL validation
      if (image.source_url) {
        try {
          new URL(image.source_url);
          if (!image.source_url.includes('wikimedia.org') && 
              !image.source_url.includes('unsplash.com') &&
              !image.source_url.includes('pexels.com')) {
            this.addWarning(`Image from non-verified source`, { image_id: image.id });
          }
        } catch (error) {
          this.addError(`Invalid image source URL`, { image_id: image.id });
          imageValid = false;
        }
      }

      // Attribution validation
      if (image.license && image.license.includes('CC BY') && !image.attribution) {
        this.addError(`Missing attribution for CC BY licensed image`, { image_id: image.id });
        imageValid = false;
      }

      if (imageValid) {
        this.stats.validImages++;
      }
    }
  }

  /**
   * Check if URLs are accessible
   */
  async checkUrls() {
    if (!this.checkUrls) return;

    this.log('Checking URL accessibility...');

    const urlsToCheck = [];
    
    // Collect URLs from spots
    for (const spot of this.spots) {
      if (spot.website) urlsToCheck.push({ url: spot.website, context: `spot:${spot.id}:website` });
      
      if (spot.sources) {
        for (const source of spot.sources) {
          if (source.url) urlsToCheck.push({ url: source.url, context: `spot:${spot.id}:source` });
        }
      }
    }

    // Collect URLs from images (if checking images)
    if (this.checkImages && this.images.images) {
      for (const image of this.images.images) {
        if (image.source_url) {
          urlsToCheck.push({ url: image.source_url, context: `image:${image.id}:source` });
        }
      }
    }

    this.stats.urlsChecked = urlsToCheck.length;

    // Check URLs with rate limiting
    for (const { url, context } of urlsToCheck) {
      try {
        const isAccessible = await this.checkUrl(url);
        if (isAccessible) {
          this.stats.urlsWorking++;
        } else {
          this.addError(`URL not accessible: ${url}`, { context });
        }
        
        // Rate limiting - wait 500ms between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        this.addError(`Error checking URL ${url}: ${error.message}`, { context });
      }
    }
  }

  /**
   * Check if a single URL is accessible
   */
  checkUrl(url) {
    return new Promise((resolve) => {
      try {
        const urlObj = new URL(url);
        const options = {
          hostname: urlObj.hostname,
          port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: 'HEAD',
          timeout: 10000,
          headers: {
            'User-Agent': 'UAE Tourism Data Verifier 1.0'
          }
        };

        const protocol = urlObj.protocol === 'https:' ? https : require('http');
        
        const req = protocol.request(options, (res) => {
          const success = res.statusCode >= 200 && res.statusCode < 400;
          resolve(success);
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });

        req.end();
      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * Validate data consistency across files
   */
  validateConsistency() {
    this.log('Validating data consistency...');

    // Check spot IDs are unique
    const spotIds = this.spots.map(spot => spot.id);
    const uniqueSpotIds = [...new Set(spotIds)];
    if (spotIds.length !== uniqueSpotIds.length) {
      this.addError('Duplicate spot IDs found');
    }

    // Check image references
    if (this.images.images) {
      for (const image of this.images.images) {
        if (image.spot_id && !spotIds.includes(image.spot_id)) {
          this.addError(`Image references non-existent spot: ${image.spot_id}`, 
                       { image_id: image.id });
        }
      }
    }

    // Validate scrape timestamps
    for (const spot of this.spots) {
      if (spot.scrape_timestamp) {
        try {
          const timestamp = new Date(spot.scrape_timestamp);
          const now = new Date();
          const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);
          
          if (daysDiff > 30) {
            this.addWarning(`Spot data is ${Math.round(daysDiff)} days old`, 
                           { spot_id: spot.id });
          }
        } catch (error) {
          this.addError(`Invalid scrape timestamp format`, { spot_id: spot.id });
        }
      }
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const report = {
      validation_timestamp: new Date().toISOString(),
      summary: {
        total_spots: this.stats.totalSpots,
        valid_spots: this.stats.validSpots,
        spot_validation_rate: (this.stats.validSpots / this.stats.totalSpots * 100).toFixed(1) + '%',
        total_images: this.stats.totalImages,
        valid_images: this.stats.validImages,
        image_validation_rate: this.stats.totalImages > 0 ? 
          (this.stats.validImages / this.stats.totalImages * 100).toFixed(1) + '%' : 'N/A',
        urls_checked: this.stats.urlsChecked,
        urls_working: this.stats.urlsWorking,
        url_success_rate: this.stats.urlsChecked > 0 ? 
          (this.stats.urlsWorking / this.stats.urlsChecked * 100).toFixed(1) + '%' : 'N/A'
      },
      validation_status: this.errors.length === 0 ? 'PASSED' : 'FAILED',
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * Generate recommendations based on validation results
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.stats.validSpots < this.stats.totalSpots) {
      recommendations.push('Fix required field validation errors before publishing');
    }

    if (this.warnings.length > 0) {
      recommendations.push('Review and address validation warnings');
    }

    if (this.stats.totalImages === 0) {
      recommendations.push('Add images to improve user experience');
    }

    if (this.stats.urlsChecked > 0 && this.stats.urlsWorking < this.stats.urlsChecked) {
      recommendations.push('Update or remove broken URLs');
    }

    const spotsWithoutWebsites = this.spots.filter(spot => !spot.website).length;
    if (spotsWithoutWebsites > 0) {
      recommendations.push(`Add official websites for ${spotsWithoutWebsites} spots`);
    }

    return recommendations;
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log('🔍 UAE Tourist Spots Data Validation');
    console.log('====================================');

    const dataLoaded = await this.loadData();
    if (!dataLoaded) {
      return false;
    }

    this.validateSpotFields();
    this.validateImages();
    this.validateConsistency();
    
    if (this.checkUrls) {
      await this.checkUrls();
    }

    const report = this.generateReport();

    // Save validation report
    await fs.writeFile(
      path.join(this.dataDir, 'validation_report.json'),
      JSON.stringify(report, null, 2)
    );

    // Print summary
    console.log('\\n📊 Validation Summary:');
    console.log(`Status: ${report.validation_status === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Spots: ${report.summary.valid_spots}/${report.summary.total_spots} valid (${report.summary.spot_validation_rate})`);
    console.log(`Images: ${report.summary.valid_images}/${report.summary.total_images} valid (${report.summary.image_validation_rate})`);
    
    if (this.checkUrls) {
      console.log(`URLs: ${report.summary.urls_working}/${report.summary.urls_checked} working (${report.summary.url_success_rate})`);
    }

    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\\n❌ Errors:');
      this.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.message}`);
        if (error.context && Object.keys(error.context).length > 0) {
          console.log(`   Context: ${JSON.stringify(error.context)}`);
        }
      });
    }

    if (this.warnings.length > 0 && this.verbose) {
      console.log('\\n⚠️  Warnings:');
      this.warnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.message}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log('\\n💡 Recommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    console.log(`\\n📄 Full report saved to: validation_report.json`);
    
    return report.validation_status === 'PASSED';
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    verbose: args.includes('--verbose'),
    checkImages: args.includes('--check-images'),
    checkUrls: args.includes('--check-urls'),
    dataDir: './'
  };

  // Extract custom data directory if provided
  const dataDirIndex = args.indexOf('--data-dir');
  if (dataDirIndex !== -1 && args[dataDirIndex + 1]) {
    options.dataDir = args[dataDirIndex + 1];
  }

  const verifier = new DataVerifier(options);
  const success = await verifier.validate();
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DataVerifier };