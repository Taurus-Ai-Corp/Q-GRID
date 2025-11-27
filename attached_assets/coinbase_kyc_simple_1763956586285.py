#!/usr/bin/env python3
"""
TAURUS AI - Simple Coinbase KYC Form Automation
Direct automation of the KYC form
"""

import json
import websocket
import time

def main():
    print("🚀 TAURUS AI - Coinbase KYC Form Automation")
    print("=" * 50)
    
    try:
        # Connect to Coinbase tab
        ws = websocket.create_connection('ws://localhost:9222/devtools/page/318DB47DF23E41CF305B8E533735233F')
        print("✅ Connected to Coinbase tab")
        
        # Enable required domains
        ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
        ws.send(json.dumps({"id": 2, "method": "Runtime.enable"}))
        ws.send(json.dumps({"id": 3, "method": "DOM.enable"}))
        
        # Clear responses
        for _ in range(3):
            ws.recv()
        
        # Get current page status
        print("📄 Checking page status...")
        ws.send(json.dumps({
            "id": 10,
            "method": "Runtime.evaluate",
            "params": {"expression": "({url: window.location.href, title: document.title})"}
        }))
        response = json.loads(ws.recv())
        page_info = response['result']['result']['value']
        print(f"   URL: {page_info['url']}")
        print(f"   Title: {page_info['title']}")
        
        # Check for form elements
        print("🔍 Analyzing form structure...")
        ws.send(json.dumps({
            "id": 11,
            "method": "Runtime.evaluate",
            "params": {
                "expression": """
                const selects = document.querySelectorAll('select');
                const buttons = document.querySelectorAll('button');
                const dropdowns = document.querySelectorAll('[role="combobox"], .select');
                
                ({
                    selectCount: selects.length,
                    buttonCount: buttons.length,
                    dropdownCount: dropdowns.length,
                    selectInfo: Array.from(selects).map(s => s.outerHTML.substring(0, 100)),
                    buttonInfo: Array.from(buttons).map(b => b.textContent.trim()).filter(t => t)
                })
                """
            }
        }))
        response = json.loads(ws.recv())
        form_info = response['result']['result']['value']
        
        print(f"   Found {form_info['selectCount']} select elements")
        print(f"   Found {form_info['buttonCount']} button elements")
        print(f"   Found {form_info['dropdownCount']} dropdown elements")
        print(f"   Buttons: {form_info['buttonInfo']}")
        
        # Try to interact with dropdowns if they exist
        if form_info['selectCount'] > 0 or form_info['dropdownCount'] > 0:
            print("📝 Attempting to fill form...")
            
            # Fill the form using a comprehensive approach
            ws.send(json.dumps({
                "id": 20,
                "method": "Runtime.evaluate",
                "params": {
                    "expression": """
                    // Function to click dropdown and select option
                    function selectDropdownOption(dropdownIndex, searchTerms) {
                        const allDropdowns = [...document.querySelectorAll('select'), ...document.querySelectorAll('[role="combobox"]')];
                        const dropdown = allDropdowns[dropdownIndex];
                        
                        if (!dropdown) return 'Dropdown not found at index ' + dropdownIndex;
                        
                        // Click to open dropdown
                        dropdown.click();
                        
                        setTimeout(() => {
                            // Look for options
                            const options = document.querySelectorAll('option, [role="option"], .option');
                            
                            for (let option of options) {
                                const text = (option.textContent || option.innerText || '').toLowerCase();
                                for (let term of searchTerms) {
                                    if (text.includes(term.toLowerCase())) {
                                        option.click();
                                        return 'Selected: ' + text;
                                    }
                                }
                            }
                            return 'No matching option found';
                        }, 500);
                        
                        return 'Clicked dropdown ' + dropdownIndex;
                    }
                    
                    // Fill first dropdown - What will you use Coinbase for?
                    let result1 = selectDropdownOption(0, ['business', 'trading', 'investment', 'buy and sell']);
                    
                    // Wait and fill second dropdown - Source of funds
                    setTimeout(() => {
                        selectDropdownOption(1, ['business', 'employment', 'salary', 'company']);
                    }, 1000);
                    
                    // Wait and fill third dropdown - Employment status  
                    setTimeout(() => {
                        selectDropdownOption(2, ['self-employed', 'business owner', 'entrepreneur', 'employed']);
                    }, 2000);
                    
                    'Form filling initiated: ' + result1;
                    """
                }
            }))
            response = json.loads(ws.recv())
            print(f"   Form filling result: {response['result']['result']['value']}")
            
            # Wait for form to be filled
            time.sleep(3)
            
            # Check if form is filled and submit
            print("✅ Attempting to submit form...")
            ws.send(json.dumps({
                "id": 30,
                "method": "Runtime.evaluate",
                "params": {
                    "expression": """
                    // Find continue button
                    const buttons = document.querySelectorAll('button');
                    let continueButton = null;
                    
                    for (let btn of buttons) {
                        const text = btn.textContent.toLowerCase();
                        if (text.includes('continue') || text.includes('submit') || text.includes('next')) {
                            continueButton = btn;
                            break;
                        }
                    }
                    
                    if (continueButton && !continueButton.disabled) {
                        continueButton.click();
                        'Form submitted successfully';
                    } else if (continueButton && continueButton.disabled) {
                        'Continue button found but disabled - form may need completion';
                    } else {
                        'Continue button not found';
                    }
                    """
                }
            }))
            response = json.loads(ws.recv())
            print(f"   Submit result: {response['result']['result']['value']}")
            
            # Monitor for page change
            print("👁️  Monitoring for page changes...")
            for i in range(5):
                time.sleep(1)
                ws.send(json.dumps({
                    "id": 40 + i,
                    "method": "Runtime.evaluate",
                    "params": {"expression": "window.location.href"}
                }))
                response = json.loads(ws.recv())
                current_url = response['result']['result']['value']
                
                if current_url != page_info['url']:
                    print(f"   ✅ Page changed to: {current_url}")
                    print("🎉 KYC form progression successful!")
                    break
                else:
                    print(f"   Checking... ({i+1}/5)")
        
        else:
            print("❌ No form elements found - page may have already progressed")
        
        ws.close()
        print("\n📋 NEXT STEPS:")
        print("   • Complete identity verification if prompted")
        print("   • Upload required documents")
        print("   • Wait for Coinbase verification approval")
        print("   • Return to API key generation once verified")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()