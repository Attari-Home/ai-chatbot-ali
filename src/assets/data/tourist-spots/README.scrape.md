# UAE Tourist Spots Scraper

This repository contains a comprehensive data collection system for UAE tourist attractions, built with web scraping best practices, legal compliance, and developer-friendly outputs.

## 🎯 Project Overview

The UAE Tourist Spots Scraper is designed to:
- ✅ Ethically collect tourist attraction data from public sources
- 🖼️ Gather high-quality, properly licensed images
- 🗺️ Provide accurate geolocation data
- 📱 Generate developer-ready datasets
- 🔍 Maintain full transparency and compliance

## 📁 Project Structure

```
src/assets/data/tourist-spots/
├── uae_tourist_spots.json      # Master dataset
├── uae_tourist_spots.csv       # CSV export for easy import
├── images_metadata.json        # Image licensing and attribution
├── sources_log.json           # Scraping session log
├── scrape-uae-spots.js        # Main scraper script
├── verification_script.js     # Data validation script
├── run_scrape.sh             # Execution script
├── README.scrape.md          # This file
├── frontend_spec.md          # Developer implementation guide
└── images/                   # Downloaded images (CC-licensed)
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MCP Playwright Server** - Install from VS Code extensions
3. **Optional**: API keys for enhanced data sources

### Environment Setup

Create a `.env` file:

```bash
# Required for image downloads (optional)
UNSPLASH_ACCESS_KEY=your_unsplash_key_here

# Scraping configuration
SCRAPE_DELAY_MS=1200
USER_AGENT="UAE Tourism Research Bot 1.0 (research@example.com)"

# Output configuration  
OUTPUT_DIR=./output
MAX_IMAGES_PER_SPOT=3
```

### Installation

```bash
# Install dependencies
npm install playwright axios cheerio

# Make scripts executable
chmod +x run_scrape.sh
chmod +x verification_script.js
```

### Running the Scraper

```bash
# Full scrape (respects rate limits)
./run_scrape.sh

# Dry run (no actual requests)
./run_scrape.sh --dry-run

# Verbose logging
./run_scrape.sh --verbose

# Custom output directory
./run_scrape.sh --output ./custom_output
```

## 🔍 Data Sources & Compliance

### Primary Sources
- **Wikipedia**: Factual information, coordinates, categories
- **Wikimedia Commons**: CC-licensed images with full attribution
- **Official Tourism Sites**: Current hours, pricing, events
- **OpenStreetMap Nominatim**: Geocoding and address verification

### Legal Compliance

✅ **Robots.txt Compliance**: All domains checked before scraping  
✅ **Rate Limiting**: 1+ second delays between requests  
✅ **Image Licensing**: Only CC0/CC BY images downloaded  
✅ **Attribution**: Full credit provided for all content  
✅ **No Personal Data**: Only public information collected  

### Robots.txt Status
| Domain | Status | Notes |
|--------|--------|--------|
| en.wikipedia.org | ✅ Allowed | Standard Wikipedia crawling policies |
| commons.wikimedia.org | ✅ Allowed | Media metadata access permitted |
| burjkhalifa.ae | ✅ Allowed | Official site allows crawling |
| szgmc.gov.ae | ✅ Allowed | Government site, public information |
| louvreabudhabi.ae | ✅ Allowed | Museum site with public data |

## 🎨 Image Handling

### License Requirements
- **CC0**: Public domain, no attribution required
- **CC BY**: Attribution required
- **CC BY-SA**: Attribution + share-alike required
- **All Rights Reserved**: ❌ Not downloaded, URL only stored

### Image Processing
```bash
# Automatic thumbnail generation (1200px wide)
npm run generate-thumbnails

# WebP conversion for better performance  
npm run convert-to-webp

# License verification
npm run verify-licenses
```

## 📊 Data Validation

Run the verification script to ensure data quality:

```bash
node verification_script.js

# Output example:
✅ All spots have required fields
✅ Coordinates are within UAE boundaries  
✅ All images have valid licenses
✅ All source URLs are accessible
⚠️  2 spots missing opening hours
```

### Data Quality Checks
- Required fields: `id`, `name`, `coordinates`, `emirate`
- Coordinate bounds: UAE geographic boundaries
- Image licenses: Only permissive licenses
- URL validation: All source links working
- Duplicate detection: No duplicate entries

## 🔄 Re-running & Updates

### Incremental Updates
```bash
# Update only changed data (recommended)
./run_scrape.sh --incremental

# Force full refresh
./run_scrape.sh --force-refresh

# Update specific spots
./run_scrape.sh --spots "burj-khalifa,louvre-abu-dhabi"
```

### Scheduling
```bash
# Add to crontab for weekly updates
0 2 * * 0 /path/to/run_scrape.sh --incremental
```

## 🛠️ Troubleshooting

### Common Issues

**Connection timeouts**
```bash
# Increase delays
export SCRAPE_DELAY_MS=2000
./run_scrape.sh
```

**Rate limiting errors**
```bash
# Check if you're being blocked
curl -I https://en.wikipedia.org/wiki/Burj_Khalifa

# Wait and retry with longer delays
export SCRAPE_DELAY_MS=5000
```

**Image download failures**
```bash
# Verify Wikimedia Commons access
curl -I https://commons.wikimedia.org/

# Check image URLs manually
node verification_script.js --check-images
```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* ./run_scrape.sh --verbose

# Save debug output
./run_scrape.sh --verbose > scrape_debug.log 2>&1
```

## 📈 Performance Optimization

### Parallel Processing
```javascript
// Modify scrape-uae-spots.js for concurrent scraping
const CONCURRENT_SPOTS = 2; // Max 2 to respect rate limits
```

### Caching
```bash
# Enable response caching
export ENABLE_CACHE=true
export CACHE_TTL_HOURS=24
```

### Image Optimization
```bash
# Generate WebP thumbnails
npm run optimize-images

# Before: 2.5MB per image
# After:  250KB per WebP thumbnail
```

## 🚨 Error Handling

The scraper includes comprehensive error handling:

- **Network failures**: Automatic retry with exponential backoff
- **Rate limiting**: Automatic delay increases
- **Invalid data**: Logged but continues processing
- **License violations**: Image skipped, not downloaded

### Error Logs
Check `scrape_session_log.json` for detailed error information:

```json
{
  "timestamp": "2025-09-20T12:34:56Z",
  "level": "error", 
  "message": "Failed to extract coordinates from Louvre Abu Dhabi page",
  "context": {"spot_id": "louvre-abu-dhabi", "url": "..."}
}
```

## 🔐 Security Considerations

- No authentication credentials stored in code
- Rate limiting prevents server overload
- User-Agent identifies scraper purpose
- Respects all robots.txt directives
- No personal data collection

## 🤝 Contributing

### Adding New Spots
1. Add spot configuration to `SPOT_CONFIGS` in `scrape-uae-spots.js`
2. Run verification: `node verification_script.js --spot new-spot-id`
3. Test with dry run: `./run_scrape.sh --dry-run --spots new-spot-id`

### Improving Data Quality
1. Fork the repository
2. Add new validation rules in `verification_script.js`
3. Test with existing data
4. Submit pull request

## 📞 Support

For issues or questions:
- Check `scrape_session_log.json` for detailed logs
- Review `sources_log.json` for compliance status
- Run `node verification_script.js` for data validation
- Create GitHub issue with log files attached

## 📜 License & Attribution

This scraper and its output data are released under MIT License.

**Attribution Requirements:**
- Images: Individual attribution as specified in `images_metadata.json`
- Wikipedia content: CC BY-SA 3.0
- Geographic data: © OpenStreetMap contributors

## 🔮 Future Enhancements

- [ ] Arabic language content extraction
- [ ] Real-time price monitoring
- [ ] Social media integration
- [ ] Weather-based recommendations
- [ ] Event calendar integration
- [ ] Multi-language support
- [ ] REST API endpoint
- [ ] Automated testing pipeline

---

**Last Updated**: September 20, 2025  
**Scraper Version**: 1.0.0  
**Compatibility**: Node.js 16+, MCP Playwright