#!/usr/bin/env python3
"""
TAURUS AI - Coinbase KYC Form Automation
Complete the "Tell us about yourself" form for TAURUS AI Corp
"""

import json
import websocket
import time
import sys

def connect_to_coinbase_tab():
    """Connect to the active Coinbase tab"""
    print("🔌 Connecting to Coinbase KYC page...")
    
    # Connect to the Coinbase tab WebSocket
    ws_url = "ws://localhost:9222/devtools/page/318DB47DF23E41CF305B8E533735233F"
    ws = websocket.create_connection(ws_url)
    
    # Enable necessary Chrome DevTools domains
    ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
    ws.send(json.dumps({"id": 2, "method": "Runtime.enable"}))
    ws.send(json.dumps({"id": 3, "method": "DOM.enable"}))
    
    # Clear any existing responses
    for _ in range(3):
        ws.recv()
    
    return ws

def get_page_info(ws):
    """Get current page information"""
    print("📄 Checking current page status...")
    
    ws.send(json.dumps({
        "id": 10,
        "method": "Runtime.evaluate",
        "params": {
            "expression": "({url: window.location.href, title: document.title, ready: document.readyState})"
        }
    }))
    
    response = json.loads(ws.recv())
    if 'result' in response and 'result' in response['result']:
        page_info = response['result']['result']['value']
        print(f"   URL: {page_info['url']}")
        print(f"   Title: {page_info['title']}")
        print(f"   Ready State: {page_info['ready']}")
        return page_info
    return None

def fill_kyc_form(ws):
    """Fill the KYC form with TAURUS AI Corp information"""
    print("📝 Filling KYC form with TAURUS AI Corp information...")
    
    # First, check if form elements are present
    print("   Checking form elements...")
    ws.send(json.dumps({
        "id": 20,
        "method": "Runtime.evaluate",
        "params": {
            "expression": """
            const dropdowns = document.querySelectorAll('select, .select, [role="combobox"]');
            const buttons = document.querySelectorAll('button');
            
            ({
                dropdownCount: dropdowns.length,
                buttonCount: buttons.length,
                hasSelectOptions: dropdowns.length > 0,
                continueButton: !!document.querySelector('button[type="submit"], button:contains("Continue")')
            })
            """
        }
    }))
    
    response = json.loads(ws.recv())
    if 'result' in response:
        form_info = response['result']['result']['value']
        print(f"   Found {form_info['dropdownCount']} dropdowns")
        print(f"   Found {form_info['buttonCount']} buttons")
    
    # Now let's try to interact with the form elements
    print("   Filling form fields...")
    
    # Step 1: What will you use Coinbase for?
    print("   Step 1: Setting Coinbase usage purpose...")
    ws.send(json.dumps({
        "id": 21,
        "method": "Runtime.evaluate",
        "params": {
            "expression": """
            // Find the first dropdown (What will you use Coinbase for?)
            const firstDropdown = document.querySelector('select, .select, [role="combobox"]');
            if (firstDropdown) {
                firstDropdown.click();
                setTimeout(() => {
                    // Look for business/trading related options
                    const options = document.querySelectorAll('option, .option, [role="option"]');
                    for (let option of options) {
                        const text = option.textContent || option.innerText;
                        if (text.toLowerCase().includes('business') || 
                            text.toLowerCase().includes('trading') ||
                            text.toLowerCase().includes('investment')) {
                            option.click();
                            break;
                        }
                    }
                }, 500);
                'First dropdown clicked';
            } else {
                'No first dropdown found';
            }
            """
        }
    }))
    
    response = json.loads(ws.recv())
    print(f"   First dropdown: {response['result']['result']['value']}")
    time.sleep(2)
    
    # Step 2: What is your source of funds?
    print("   Step 2: Setting source of funds...")
    ws.send(json.dumps({
        "id": 22,
        "method": "Runtime.evaluate",
        "params": {
            "expression": """
            // Find the second dropdown (source of funds)
            const dropdowns = document.querySelectorAll('select, .select, [role="combobox"]');
            const secondDropdown = dropdowns[1];
            if (secondDropdown) {
                secondDropdown.click();
                setTimeout(() => {
                    const options = document.querySelectorAll('option, .option, [role="option"]');
                    for (let option of options) {
                        const text = option.textContent || option.innerText;
                        if (text.toLowerCase().includes('business') || 
                            text.toLowerCase().includes('company') ||
                            text.toLowerCase().includes('employment')) {
                            option.click();
                            break;
                        }
                    }
                }, 500);
                'Second dropdown clicked';
            } else {
                'No second dropdown found';
            }
            """
        }
    }))
    
    response = json.loads(ws.recv())
    print(f"   Second dropdown: {response['result']['result']['value']}")
    time.sleep(2)
    
    # Step 3: What is your primary employment status?
    print("   Step 3: Setting employment status...")
    ws.send(json.dumps({
        "id": 23,
        "method": "Runtime.evaluate",
        "params": {
            "expression": """
            // Find the third dropdown (employment status)
            const dropdowns = document.querySelectorAll('select, .select, [role="combobox"]');
            const thirdDropdown = dropdowns[2];
            if (thirdDropdown) {
                thirdDropdown.click();
                setTimeout(() => {
                    const options = document.querySelectorAll('option, .option, [role="option"]');
                    for (let option of options) {
                        const text = option.textContent || option.innerText;
                        if (text.toLowerCase().includes('self') || 
                            text.toLowerCase().includes('owner') ||
                            text.toLowerCase().includes('entrepreneur') ||
                            text.toLowerCase().includes('business')) {
                            option.click();
                            break;
                        }
                    }
                }, 500);
                'Third dropdown clicked';
            } else {
                'No third dropdown found';
            }
            """
        }
    }))
    
    response = json.loads(ws.recv())
    print(f"   Third dropdown: {response['result']['result']['value']}")
    time.sleep(2)

def submit_form(ws):
    """Submit the KYC form"""
    print("✅ Submitting KYC form...")
    
    ws.send(json.dumps({
        "id": 30,
        "method": "Runtime.evaluate",
        "params": {
            "expression": """
            // Find and click the Continue button
            const continueBtn = document.querySelector('button[type="submit"]') || 
                              document.querySelector('button:contains("Continue")') ||
                              Array.from(document.querySelectorAll('button')).find(btn => 
                                  btn.textContent.toLowerCase().includes('continue'));
            
            if (continueBtn) {
                continueBtn.click();
                'Form submitted';
            } else {
                'Continue button not found';
            }
            """
        }
    }))
    
    response = json.loads(ws.recv())
    print(f"   Submit result: {response['result']['result']['value']}")

def monitor_progress(ws):
    """Monitor form submission progress"""
    print("👁️  Monitoring form submission progress...")
    
    for i in range(10):  # Check for 10 seconds
        ws.send(json.dumps({
            "id": 40 + i,
            "method": "Runtime.evaluate",
            "params": {
                "expression": "({url: window.location.href, title: document.title})"
            }
        }))
        
        response = json.loads(ws.recv())
        if 'result' in response:
            page_info = response['result']['result']['value']
            if page_info['url'] != "https://www.coinbase.com/setup/basic-kyc":
                print(f"   Page changed to: {page_info['url']}")
                print(f"   New title: {page_info['title']}")
                return True
        
        time.sleep(1)
        print(f"   Checking progress... ({i+1}/10)")
    
    return False

def main():
    """Main automation function"""
    print("🚀 TAURUS AI - Coinbase KYC Automation")
    print("=" * 50)
    
    try:
        # Connect to Coinbase tab
        ws = connect_to_coinbase_tab()
        
        # Get page info
        page_info = get_page_info(ws)
        if not page_info:
            print("❌ Failed to get page information")
            return False
        
        # Verify we're on the KYC page
        if "basic-kyc" not in page_info['url']:
            print(f"❌ Not on KYC page. Current URL: {page_info['url']}")
            return False
        
        print("✅ Connected to Coinbase KYC page")
        
        # Fill the form
        fill_kyc_form(ws)
        
        # Submit the form
        submit_form(ws)
        
        # Monitor progress
        success = monitor_progress(ws)
        
        if success:
            print("🎉 KYC form submitted successfully!")
            print("📋 Next steps: Complete identity verification when prompted")
            return True
        else:
            print("⚠️  Form may need manual completion")
            return False
            
    except Exception as e:
        print(f"❌ Automation error: {str(e)}")
        return False
    
    finally:
        try:
            ws.close()
        except:
            pass

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)