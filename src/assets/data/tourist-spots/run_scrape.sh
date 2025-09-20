#!/bin/bash

# UAE Tourist Spots Scraper Execution Script
# Usage: ./run_scrape.sh [--dry-run] [--verbose] [--check-urls] [--output DIR]

set -e  # Exit on any error

# Default configuration
DEFAULT_OUTPUT_DIR="./scrape_output"
DEFAULT_DELAY_MS=1200
DEFAULT_USER_AGENT="UAE Tourism Research Bot 1.0 (research@example.com)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
DRY_RUN=false
VERBOSE=false
CHECK_URLS=false
OUTPUT_DIR="$DEFAULT_OUTPUT_DIR"
SPOTS=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --check-urls)
      CHECK_URLS=true
      shift
      ;;
    --output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --spots)
      SPOTS="$2"
      shift 2
      ;;
    --help)
      echo "UAE Tourist Spots Scraper"
      echo ""
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --dry-run        Run without making actual HTTP requests"
      echo "  --verbose        Enable detailed logging"
      echo "  --check-urls     Verify all URLs are accessible"
      echo "  --output DIR     Output directory (default: $DEFAULT_OUTPUT_DIR)"
      echo "  --spots LIST     Comma-separated list of specific spots to scrape"
      echo "  --help           Show this help message"
      echo ""
      echo "Environment Variables:"
      echo "  SCRAPE_DELAY_MS        Delay between requests (default: $DEFAULT_DELAY_MS)"
      echo "  USER_AGENT            User agent string (default: '$DEFAULT_USER_AGENT')"
      echo "  UNSPLASH_ACCESS_KEY   Unsplash API key for high-quality images"
      echo ""
      echo "Examples:"
      echo "  $0                                    # Full scrape"
      echo "  $0 --dry-run --verbose               # Test run with detailed output"
      echo "  $0 --spots burj-khalifa,louvre       # Scrape specific spots"
      echo "  $0 --output ./custom_output          # Custom output directory"
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Banner
echo -e "${BLUE}"
echo "🇦🇪 UAE Tourist Spots Scraper"
echo "=============================="
echo -e "${NC}"

# Environment setup
export SCRAPE_DELAY_MS=${SCRAPE_DELAY_MS:-$DEFAULT_DELAY_MS}
export USER_AGENT=${USER_AGENT:-"$DEFAULT_USER_AGENT"}

# Display configuration
echo -e "${YELLOW}Configuration:${NC}"
echo "  Output Directory: $OUTPUT_DIR"
echo "  Delay Between Requests: ${SCRAPE_DELAY_MS}ms"
echo "  User Agent: $USER_AGENT"
echo "  Dry Run: $DRY_RUN"
echo "  Verbose: $VERBOSE"
echo "  Check URLs: $CHECK_URLS"
if [[ -n "$SPOTS" ]]; then
  echo "  Specific Spots: $SPOTS"
fi
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not found. Please install Node.js 16 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 16 ]]; then
    echo -e "${RED}Error: Node.js 16 or higher required. Found version $(node --version)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check if npm packages are installed
if [[ ! -f "package.json" ]]; then
    echo -e "${YELLOW}Creating package.json...${NC}"
    cat > package.json << EOF
{
  "name": "uae-tourist-spots-scraper",
  "version": "1.0.0",
  "description": "UAE Tourist Spots Data Scraper",
  "main": "scrape-uae-spots.js",
  "scripts": {
    "scrape": "node scrape-uae-spots.js",
    "verify": "node verification_script.js",
    "test": "npm run verify"
  },
  "dependencies": {
    "playwright": "^1.40.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF
fi

if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check scraper script exists
if [[ ! -f "scrape-uae-spots.js" ]]; then
    echo -e "${RED}Error: scrape-uae-spots.js not found in current directory${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Scraper script found${NC}"

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo -e "${GREEN}✓ Output directory ready: $OUTPUT_DIR${NC}"

# Build command arguments
SCRAPER_ARGS=""
if [[ "$DRY_RUN" == "true" ]]; then
    SCRAPER_ARGS="$SCRAPER_ARGS --dry-run"
fi
if [[ "$VERBOSE" == "true" ]]; then
    SCRAPER_ARGS="$SCRAPER_ARGS --verbose"
fi

# Log start time
START_TIME=$(date +%s)
echo ""
echo -e "${BLUE}Starting scrape at $(date)${NC}"
echo ""

# Run the scraper
echo -e "${YELLOW}Executing scraper...${NC}"
cd "$OUTPUT_DIR"
if node "../scrape-uae-spots.js" $SCRAPER_ARGS; then
    echo -e "${GREEN}✅ Scraping completed successfully!${NC}"
    SCRAPE_SUCCESS=true
else
    echo -e "${RED}❌ Scraping failed with errors${NC}"
    SCRAPE_SUCCESS=false
fi

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo -e "${BLUE}Scraping completed in ${MINUTES}m ${SECONDS}s${NC}"

# Run verification if scraping was successful
if [[ "$SCRAPE_SUCCESS" == "true" ]]; then
    echo ""
    echo -e "${YELLOW}Running data verification...${NC}"
    
    VERIFY_ARGS=""
    if [[ "$VERBOSE" == "true" ]]; then
        VERIFY_ARGS="$VERIFY_ARGS --verbose"
    fi
    if [[ "$CHECK_URLS" == "true" ]]; then
        VERIFY_ARGS="$VERIFY_ARGS --check-urls"
    fi
    
    if node "../verification_script.js" $VERIFY_ARGS; then
        echo -e "${GREEN}✅ Data validation passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Data validation found issues (check validation_report.json)${NC}"
    fi
fi

# Generate summary
echo ""
echo -e "${BLUE}📊 Scraping Summary:${NC}"
echo "================================"

if [[ -f "uae_tourist_spots.json" ]]; then
    SPOT_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('uae_tourist_spots.json', 'utf8')).length)")
    echo -e "${GREEN}✓ Tourist spots scraped: $SPOT_COUNT${NC}"
else
    echo -e "${RED}✗ No spots data found${NC}"
fi

if [[ -f "images_metadata.json" ]]; then
    IMAGE_COUNT=$(node -e "const data = JSON.parse(require('fs').readFileSync('images_metadata.json', 'utf8')); console.log(data.images ? data.images.length : 0)")
    echo -e "${GREEN}✓ Images catalogued: $IMAGE_COUNT${NC}"
else
    echo -e "${YELLOW}⚠ No images metadata found${NC}"
fi

if [[ -f "sources_log.json" ]]; then
    echo -e "${GREEN}✓ Sources log generated${NC}"
else
    echo -e "${YELLOW}⚠ No sources log found${NC}"
fi

if [[ -f "validation_report.json" ]]; then
    VALIDATION_STATUS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('validation_report.json', 'utf8')).validation_status)")
    if [[ "$VALIDATION_STATUS" == "PASSED" ]]; then
        echo -e "${GREEN}✓ Data validation: PASSED${NC}"
    else
        echo -e "${YELLOW}⚠ Data validation: FAILED${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No validation report found${NC}"
fi

# List output files
echo ""
echo -e "${BLUE}📁 Output files in $OUTPUT_DIR:${NC}"
ls -la "$OUTPUT_DIR" | while read line; do
    if [[ $line =~ \.json$ ]] || [[ $line =~ \.csv$ ]]; then
        echo -e "${GREEN}  $line${NC}"
    elif [[ $line =~ ^d ]]; then
        echo -e "${BLUE}  $line${NC}"
    else
        echo "  $line"
    fi
done

# Provide next steps
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. Review validation_report.json for any issues"
echo "2. Check scrape_session_log.json for detailed logs"
echo "3. Use frontend_spec.md to implement the data in your application"
echo "4. Consider scheduling regular updates with cron"

# Print helpful commands
echo ""
echo -e "${BLUE}💡 Helpful Commands:${NC}"
echo "  View validation report: cat $OUTPUT_DIR/validation_report.json | jq"
echo "  Count spots by emirate: cat $OUTPUT_DIR/uae_tourist_spots.json | jq 'group_by(.emirate) | map({emirate: .[0].emirate, count: length})'"
echo "  Check image licenses: cat $OUTPUT_DIR/images_metadata.json | jq '.images[].license' | sort | uniq -c"
echo "  Start development server: python3 -m http.server 8000 (in $OUTPUT_DIR)"

# Exit with appropriate code
if [[ "$SCRAPE_SUCCESS" == "true" ]]; then
    exit 0
else
    exit 1
fi