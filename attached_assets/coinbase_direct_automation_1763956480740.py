#!/usr/bin/env python3
"""
TAURUS AI - Direct Coinbase API Automation
Executes the automation with Chrome DevTools and prompts you only when needed
"""

import json
import requests
import time
import websocket
import sys
import os

def execute_coinbase_automation():
    """Direct execution of Coinbase API key automation"""
    
    print("🚀 TAURUS AI - COINBASE API AUTOMATION")
    print("=" * 50)
    print("🎯 Objective: Extract production API keys for Bitcoin RWA platform")
    print("💰 Business Value: $500K+ automated trading capability")
    print("")
    
    # Check Chrome DevTools availability
    print("🔍 Checking Chrome DevTools connection...")
    try:
        response = requests.get("http://localhost:9222/json", timeout=5)
        pages = response.json()
        print(f"✅ Chrome DevTools connected - {len(pages)} tabs available")
    except:
        print("❌ Chrome DevTools not available")
        print("Run: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --remote-allow-origins=\"*\" &")
        return False
    
    # Create new tab for Coinbase
    print("🌐 Opening Coinbase Pro in new tab...")
    try:
        new_tab = requests.put("http://localhost:9222/json/new")
        tab_info = new_tab.json()
        page_id = tab_info['id']
        print(f"✅ New tab created: {page_id}")
    except Exception as e:
        print(f"❌ Failed to create tab: {e}")
        return False
    
    # Navigate to Coinbase
    print("🎯 Navigating to Coinbase Pro API settings...")
    try:
        # Enable domains first
        ws_url = tab_info['webSocketDebuggerUrl']
        ws = websocket.create_connection(ws_url)
        
        # Enable Page and Runtime domains
        ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
        ws.recv()
        ws.send(json.dumps({"id": 2, "method": "Runtime.enable"}))
        ws.recv()
        
        # Navigate to Coinbase
        ws.send(json.dumps({
            "id": 3,
            "method": "Page.navigate",
            "params": {"url": "https://pro.coinbase.com/profile/api"}
        }))
        ws.recv()
        
        # Wait for page load
        time.sleep(5)
        
        # Check current URL
        ws.send(json.dumps({
            "id": 4,
            "method": "Runtime.evaluate",
            "params": {"expression": "window.location.href"}
        }))
        response = json.loads(ws.recv())
        current_url = response.get('result', {}).get('result', {}).get('value', '')
        
        print(f"📍 Current URL: {current_url}")
        
        if 'signin' in current_url or 'login' in current_url:
            print("🔐 LOGIN REQUIRED!")
            print("MANUAL ACTION NEEDED:")
            print("1. Switch to the Chrome browser window")
            print("2. Complete login with your Coinbase credentials")
            print("3. Complete 2FA if prompted")
            print("4. You should land on the API settings page")
            print("")
            input("Press ENTER when you've completed login and are on the API page...")
            
            # Refresh to check status
            ws.send(json.dumps({
                "id": 5,
                "method": "Runtime.evaluate",
                "params": {"expression": "window.location.href"}
            }))
            response = json.loads(ws.recv())
            current_url = response.get('result', {}).get('result', {}).get('value', '')
            print(f"📍 Updated URL: {current_url}")
        
        # Now automate API key creation
        print("🔑 Automating API key creation...")
        
        # Look for New API Key button
        ws.send(json.dumps({
            "id": 6,
            "method": "Runtime.evaluate",
            "params": {"expression": "document.querySelector('button').click()"}
        }))
        ws.recv()
        time.sleep(2)
        
        # Set permissions (check all boxes)
        ws.send(json.dumps({
            "id": 7,
            "method": "Runtime.evaluate",
            "params": {"expression": """
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => cb.checked = true);
                console.log('Permissions set');
            """}
        }))
        ws.recv()
        
        # Set passphrase
        passphrase = "TaurusAI_Bitcoin_RWA_2025"
        ws.send(json.dumps({
            "id": 8,
            "method": "Runtime.evaluate",
            "params": {"expression": f"""
                const passphraseInput = document.querySelector('input[type="password"], input[placeholder*="passphrase"]');
                if (passphraseInput) {{
                    passphraseInput.value = '{passphrase}';
                    console.log('Passphrase set');
                }}
            """}
        }))
        ws.recv()
        
        # Submit form
        ws.send(json.dumps({
            "id": 9,
            "method": "Runtime.evaluate",
            "params": {"expression": """
                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.click();
                    console.log('Form submitted');
                }
            """}
        }))
        ws.recv()
        
        time.sleep(3)
        
        # Extract credentials
        print("📝 Extracting API credentials...")
        
        # Try multiple selectors for API key
        ws.send(json.dumps({
            "id": 10,
            "method": "Runtime.evaluate",
            "params": {"expression": """
                let apiKey = null;
                let apiSecret = null;
                
                // Try various selectors for API key
                const keySelectors = [
                    '[data-testid="api-key"]',
                    '.api-key',
                    'code:contains("cb_")',
                    'span:contains("cb_")'
                ];
                
                for (let selector of keySelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.includes('cb_')) {
                        apiKey = el.textContent.trim();
                        break;
                    }
                }
                
                // Try various selectors for API secret
                const secretSelectors = [
                    '[data-testid="api-secret"]',
                    '.api-secret',
                    'textarea',
                    'code'
                ];
                
                for (let selector of secretSelectors) {
                    const el = document.querySelector(selector);
                    if (el && el.textContent.length > 30 && !el.textContent.includes('cb_')) {
                        apiSecret = el.textContent.trim();
                        break;
                    }
                }
                
                JSON.stringify({apiKey, apiSecret});
            """}
        }))
        response = json.loads(ws.recv())
        credentials_str = response.get('result', {}).get('result', {}).get('value', '{}')
        credentials = json.loads(credentials_str)
        
        print("🎯 EXTRACTION RESULTS:")
        print(f"API Key: {credentials.get('apiKey', 'Not found')}")
        print(f"API Secret: {credentials.get('apiSecret', 'Not found')}")
        
        if credentials.get('apiKey') and credentials.get('apiSecret'):
            # Update environment file
            update_environment_variables(credentials['apiKey'], credentials['apiSecret'], passphrase)
            print("🎉 SUCCESS! API keys configured for TAURUS AI Bitcoin RWA platform")
            print("💰 Ready for $500K+ automated trading operations")
            return True
        else:
            print("❌ Could not extract credentials automatically")
            print("MANUAL ACTION: Please copy the API key and secret from the browser")
            api_key = input("Enter API Key: ")
            api_secret = input("Enter API Secret: ")
            
            if api_key and api_secret:
                update_environment_variables(api_key, api_secret, passphrase)
                print("✅ Manual configuration completed!")
                return True
        
        ws.close()
        
    except Exception as e:
        print(f"❌ Automation error: {e}")
        return False

def update_environment_variables(api_key, api_secret, passphrase):
    """Update .env.production with real API keys"""
    print("💾 Updating environment variables...")
    
    env_file = "/Users/user/Documents/TAURUS AI Corp./CURSOR Projects/Taurus_OrionGrid/.env.production"
    
    try:
        with open(env_file, 'r') as f:
            content = f.read()
        
        # Replace placeholder values
        content = content.replace(
            'COINBASE_X402_API_KEY=your-coinbase-x402-key',
            f'COINBASE_API_KEY={api_key}'
        )
        content = content.replace(
            'COINBASE_X402_SECRET=your-coinbase-x402-secret',
            f'COINBASE_API_SECRET={api_secret}'
        )
        
        # Add passphrase if not exists
        if 'COINBASE_PASSPHRASE' not in content:
            content += f'\nCOINBASE_PASSPHRASE={passphrase}\n'
        
        with open(env_file, 'w') as f:
            f.write(content)
        
        print("✅ Environment variables updated successfully!")
        print(f"📁 File: {env_file}")
        
    except Exception as e:
        print(f"❌ Error updating environment file: {e}")

if __name__ == "__main__":
    success = execute_coinbase_automation()
    
    if success:
        print("\n🚀 TAURUS AI BITCOIN RWA PLATFORM - READY FOR DEPLOYMENT")
        print("🔑 Production API keys configured")
        print("💰 Transaction capabilities enabled")
        print("🎯 Revenue target: $2.5M Year 1")
    else:
        print("\n❌ Setup incomplete - manual configuration required")