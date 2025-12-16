#!/usr/bin/env python3
"""
TAURUS AI - Coinbase API Key Automation
Direct automation using existing Chrome DevTools connection
"""

import json
import requests
import time
import websocket
import threading

class CoinbaseAPIAutomation:
    def __init__(self):
        self.chrome_debug_url = "http://localhost:9222"
        self.page_id = None
        self.ws = None
        
    def get_active_page(self):
        """Get active Chrome page"""
        try:
            response = requests.get(f"{self.chrome_debug_url}/json")
            pages = response.json()
            for page in pages:
                if page['type'] == 'page':
                    self.page_id = page['id']
                    return page['webSocketDebuggerUrl']
            return None
        except Exception as e:
            print(f"❌ Error getting active page: {e}")
            return None
    
    def connect_websocket(self, ws_url):
        """Connect to Chrome DevTools WebSocket"""
        try:
            self.ws = websocket.create_connection(ws_url)
            return True
        except Exception as e:
            print(f"❌ WebSocket connection failed: {e}")
            return False
    
    def send_command(self, method, params=None):
        """Send command to Chrome DevTools"""
        if not self.ws:
            return None
            
        command = {
            "id": int(time.time() * 1000),
            "method": method,
            "params": params or {}
        }
        
        try:
            self.ws.send(json.dumps(command))
            response = self.ws.recv()
            return json.loads(response)
        except Exception as e:
            print(f"❌ Command failed: {e}")
            return None
    
    def navigate_to_coinbase(self):
        """Navigate to Coinbase API settings"""
        print("🌐 Navigating to Coinbase Pro API settings...")
        
        # Navigate to Coinbase
        result = self.send_command("Page.navigate", {
            "url": "https://pro.coinbase.com/profile/api"
        })
        
        time.sleep(3)
        
        # Check if we're at login page
        current_url = self.send_command("Runtime.evaluate", {
            "expression": "window.location.href"
        })
        
        if current_url and "result" in current_url:
            url = current_url["result"]["value"]
            print(f"📍 Current URL: {url}")
            
            if "signin" in url or "login" in url:
                print("🔐 LOGIN REQUIRED!")
                print("Please provide your Coinbase credentials:")
                email = input("Email: ")
                password = input("Password: ")
                
                # Fill login form
                self.fill_login_form(email, password)
                return False
            else:
                print("✅ Already logged in or at API page")
                return True
        
        return False
    
    def fill_login_form(self, email, password):
        """Fill Coinbase login form"""
        print("🔑 Filling login form...")
        
        # Fill email
        self.send_command("Runtime.evaluate", {
            "expression": f"document.querySelector('input[type=\"email\"]').value = '{email}'"
        })
        
        # Fill password  
        self.send_command("Runtime.evaluate", {
            "expression": f"document.querySelector('input[type=\"password\"]').value = '{password}'"
        })
        
        # Click login button
        self.send_command("Runtime.evaluate", {
            "expression": "document.querySelector('button[type=\"submit\"]').click()"
        })
        
        time.sleep(5)
        
        # Check for 2FA
        self.check_2fa()
    
    def check_2fa(self):
        """Check and handle 2FA if required"""
        result = self.send_command("Runtime.evaluate", {
            "expression": "document.body.innerText.includes('verification') || document.body.innerText.includes('2FA')"
        })
        
        if result and result.get("result", {}).get("value"):
            print("🔐 2FA REQUIRED!")
            code = input("Enter 2FA code: ")
            
            # Fill 2FA code
            self.send_command("Runtime.evaluate", {
                "expression": f"document.querySelector('input[placeholder*=\"code\"]').value = '{code}'"
            })
            
            # Submit 2FA
            self.send_command("Runtime.evaluate", {
                "expression": "document.querySelector('button[type=\"submit\"]').click()"
            })
            
            time.sleep(3)
    
    def create_api_key(self):
        """Create new API key"""
        print("🔑 Creating new API key...")
        
        # Click "New API Key" button
        result = self.send_command("Runtime.evaluate", {
            "expression": "document.querySelector('button').click()"
        })
        
        time.sleep(2)
        
        # Set permissions
        self.send_command("Runtime.evaluate", {
            "expression": """
            document.querySelector('input[value=\"view\"]').checked = true;
            document.querySelector('input[value=\"trade\"]').checked = true;
            document.querySelector('input[value=\"transfer\"]').checked = true;
            """
        })
        
        # Set passphrase
        passphrase = "TaurusAI_Bitcoin_RWA_2025"
        self.send_command("Runtime.evaluate", {
            "expression": f"document.querySelector('input[placeholder*=\"passphrase\"]').value = '{passphrase}'"
        })
        
        # Create API key
        self.send_command("Runtime.evaluate", {
            "expression": "document.querySelector('button[type=\"submit\"]').click()"
        })
        
        time.sleep(3)
        
        # Extract credentials
        return self.extract_credentials()
    
    def extract_credentials(self):
        """Extract API credentials from page"""
        print("📝 Extracting API credentials...")
        
        # Get API key
        api_key_result = self.send_command("Runtime.evaluate", {
            "expression": "document.querySelector('[data-testid=\"api-key\"]').textContent"
        })
        
        # Get API secret
        api_secret_result = self.send_command("Runtime.evaluate", {
            "expression": "document.querySelector('[data-testid=\"api-secret\"]').textContent"
        })
        
        credentials = {}
        
        if api_key_result and "result" in api_key_result:
            credentials["api_key"] = api_key_result["result"]["value"]
            
        if api_secret_result and "result" in api_secret_result:
            credentials["api_secret"] = api_secret_result["result"]["value"]
            
        credentials["passphrase"] = "TaurusAI_Bitcoin_RWA_2025"
        
        return credentials
    
    def update_environment_file(self, credentials):
        """Update .env.production with real API keys"""
        print("💾 Updating environment variables...")
        
        env_file = "/Users/user/Documents/TAURUS AI Corp./CURSOR Projects/Taurus_OrionGrid/.env.production"
        
        # Read current file
        with open(env_file, 'r') as f:
            content = f.read()
        
        # Replace placeholder values
        content = content.replace(
            "COINBASE_X402_API_KEY=your-coinbase-x402-key",
            f"COINBASE_API_KEY={credentials['api_key']}"
        )
        content = content.replace(
            "COINBASE_X402_SECRET=your-coinbase-x402-secret", 
            f"COINBASE_API_SECRET={credentials['api_secret']}"
        )
        
        # Add passphrase
        content += f"\nCOINBASE_PASSPHRASE={credentials['passphrase']}\n"
        
        # Write updated file
        with open(env_file, 'w') as f:
            f.write(content)
        
        print("✅ Environment variables updated!")
        return credentials
    
    def run(self):
        """Main automation flow"""
        print("🚀 STARTING COINBASE API AUTOMATION")
        print("=" * 50)
        
        # Get active Chrome page
        ws_url = self.get_active_page()
        if not ws_url:
            print("❌ No active Chrome page found")
            return None
        
        # Connect WebSocket
        if not self.connect_websocket(ws_url):
            return None
        
        # Enable required domains
        self.send_command("Page.enable")
        self.send_command("Runtime.enable")
        
        # Navigate to Coinbase
        if not self.navigate_to_coinbase():
            print("🔄 Login required - restart after authentication")
            return None
        
        # Create API key
        credentials = self.create_api_key()
        
        if credentials and credentials.get("api_key"):
            print("✅ API KEY EXTRACTION SUCCESSFUL!")
            print(f"API Key: {credentials['api_key'][:20]}...")
            print(f"API Secret: {credentials['api_secret'][:20]}...")
            
            # Update environment
            self.update_environment_file(credentials)
            return credentials
        else:
            print("❌ Failed to extract API credentials")
            return None

if __name__ == "__main__":
    automation = CoinbaseAPIAutomation()
    result = automation.run()
    
    if result:
        print("\n🎉 COINBASE API SETUP COMPLETE!")
        print("💰 Ready for Bitcoin RWA trading operations")
    else:
        print("\n❌ API setup failed - manual intervention required")