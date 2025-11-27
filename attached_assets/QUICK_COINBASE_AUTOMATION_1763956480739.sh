#!/bin/bash
# TAURUS AI - Quick Coinbase API Automation Command
# One-command execution for future similar tasks

echo "🚀 TAURUS AI - Coinbase API Automation"
echo "============================================"
echo "💰 Business Value: $500K+ Bitcoin RWA Trading"
echo "🎯 Target: Coinbase Pro API Key Extraction"
echo ""

# Function to check if Chrome DevTools is running
check_chrome_devtools() {
    if curl -s http://localhost:9222/json > /dev/null 2>&1; then
        echo "✅ Chrome DevTools already running"
        return 0
    else
        echo "❌ Chrome DevTools not running"
        return 1
    fi
}

# Function to launch isolated Chrome
launch_chrome() {
    echo "🌐 Launching isolated Chrome instance..."
    
    # Kill existing Chrome if running
    killall "Google Chrome" 2>/dev/null || true
    sleep 2
    
    # Launch Chrome with debugging enabled
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
        --remote-debugging-port=9222 \
        --remote-allow-origins="*" \
        --user-data-dir=/tmp/chrome-debug &
    
    # Wait for Chrome to start
    echo "⏳ Waiting for Chrome to initialize..."
    sleep 5
    
    # Verify connection
    if check_chrome_devtools; then
        echo "✅ Chrome DevTools ready on port 9222"
    else
        echo "❌ Failed to start Chrome DevTools"
        exit 1
    fi
}

# Function to run automation
run_automation() {
    echo "🤖 Starting Coinbase API automation..."
    
    # Navigate to project directory
    cd "/Users/user/Documents/TAURUS AI Corp./CURSOR Projects/Taurus_OrionGrid"
    
    # Check if automation script exists
    if [ ! -f "coinbase_direct_automation.py" ]; then
        echo "❌ Automation script not found"
        echo "Expected: coinbase_direct_automation.py"
        exit 1
    fi
    
    # Execute automation
    python coinbase_direct_automation.py
}

# Function to restore normal Chrome
restore_chrome() {
    echo "🔄 Restoring normal Chrome with profiles..."
    
    # Kill isolated Chrome
    killall "Google Chrome" 2>/dev/null || true
    sleep 2
    
    # Launch normal Chrome
    open -a "Google Chrome"
    
    echo "✅ Normal Chrome restored with all profiles"
}

# Function to show status
show_status() {
    echo ""
    echo "📊 AUTOMATION STATUS:"
    
    # Check Chrome DevTools
    if check_chrome_devtools; then
        echo "   Chrome DevTools: ✅ Running"
        
        # Check number of tabs
        TAB_COUNT=$(curl -s http://localhost:9222/json | jq '. | length')
        echo "   Open Tabs: $TAB_COUNT"
        
        # Check for Coinbase tabs
        COINBASE_TABS=$(curl -s http://localhost:9222/json | jq '.[] | select(.url | contains("coinbase")) | .title' | wc -l)
        echo "   Coinbase Tabs: $COINBASE_TABS"
    else
        echo "   Chrome DevTools: ❌ Not running"
    fi
    
    # Check environment file
    ENV_FILE="/Users/user/Documents/TAURUS AI Corp./CURSOR Projects/Taurus_OrionGrid/.env.production"
    if [ -f "$ENV_FILE" ]; then
        echo "   Environment File: ✅ Present"
        
        # Check for API keys
        if grep -q "COINBASE_API_KEY=" "$ENV_FILE" && ! grep -q "your-coinbase" "$ENV_FILE"; then
            echo "   API Keys: ✅ Configured"
        else
            echo "   API Keys: ❌ Not configured"
        fi
    else
        echo "   Environment File: ❌ Missing"
    fi
}

# Function to monitor Coinbase verification
monitor_verification() {
    echo "👁️  Monitoring Coinbase verification status..."
    
    cd "/Users/user/Documents/TAURUS AI Corp./CURSOR Projects/Taurus_OrionGrid"
    
    if [ -f "check_coinbase_status.py" ]; then
        python check_coinbase_status.py
    else
        echo "❌ Status monitoring script not found"
    fi
}

# Main execution based on parameters
case "${1:-auto}" in
    "chrome")
        launch_chrome
        ;;
    "run")
        run_automation
        ;;
    "restore")
        restore_chrome
        ;;
    "status")
        show_status
        ;;
    "monitor")
        monitor_verification
        ;;
    "auto")
        echo "🔄 Full automation sequence..."
        launch_chrome
        sleep 3
        run_automation
        ;;
    "help")
        echo ""
        echo "USAGE: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  auto     - Full automation (default)"
        echo "  chrome   - Launch isolated Chrome only"
        echo "  run      - Run automation only"
        echo "  restore  - Restore normal Chrome"
        echo "  status   - Show current status"
        echo "  monitor  - Monitor verification status"
        echo "  help     - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0                    # Full automation"
        echo "  $0 chrome             # Just launch Chrome"
        echo "  $0 status             # Check status"
        echo "  $0 restore            # Restore normal Chrome"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
echo "🎉 TAURUS AI Coinbase Automation Complete!"
echo "💡 Use '$0 help' for more options"