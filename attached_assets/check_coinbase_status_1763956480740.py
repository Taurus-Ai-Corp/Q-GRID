#!/usr/bin/env python3
"""
Check current status of Coinbase identity verification
"""

import json
import websocket
import time

def check_coinbase_status():
    """Check what's happening on Coinbase verification page"""
    
    print("🔍 Checking Coinbase verification status...")
    
    try:
        # Connect to the Coinbase tab
        ws_url = "ws://localhost:9222/devtools/page/FAA7B0696B6C43DB988EC2A058976341"
        ws = websocket.create_connection(ws_url)
        
        # Enable domains
        ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
        ws.recv()
        ws.send(json.dumps({"id": 2, "method": "Runtime.enable"}))
        ws.recv()
        
        # Get current URL
        ws.send(json.dumps({
            "id": 3,
            "method": "Runtime.evaluate",
            "params": {"expression": "window.location.href"}
        }))
        response = json.loads(ws.recv())
        current_url = response.get('result', {}).get('result', {}).get('value', '')
        print(f"📍 Current URL: {current_url}")
        
        # Get page title
        ws.send(json.dumps({
            "id": 4,
            "method": "Runtime.evaluate",
            "params": {"expression": "document.title"}
        }))
        response = json.loads(ws.recv())
        title = response.get('result', {}).get('result', {}).get('value', '')
        print(f"📄 Page Title: {title}")
        
        # Check for specific verification messages
        ws.send(json.dumps({
            "id": 5,
            "method": "Runtime.evaluate",
            "params": {"expression": """
                const body = document.body.innerText.toLowerCase();
                const messages = {
                    identity_verification: body.includes('identity') && body.includes('verif'),
                    document_upload: body.includes('document') && body.includes('upload'),
                    pending_review: body.includes('pending') || body.includes('review'),
                    additional_info: body.includes('additional') && body.includes('information'),
                    wait_time: body.includes('wait') || body.includes('processing'),
                    complete: body.includes('complete') || body.includes('verified'),
                    error: body.includes('error') || body.includes('failed')
                };
                JSON.stringify(messages);
            """}
        }))
        response = json.loads(ws.recv())
        status_info = json.loads(response.get('result', {}).get('result', {}).get('value', '{}'))
        
        print("\n🎯 VERIFICATION STATUS:")
        for key, value in status_info.items():
            status = "✅ DETECTED" if value else "❌ Not detected"
            print(f"   {key.replace('_', ' ').title()}: {status}")
        
        # Get visible text from main content area
        ws.send(json.dumps({
            "id": 6,
            "method": "Runtime.evaluate",
            "params": {"expression": """
                const main = document.querySelector('main, .main, [role="main"]') || document.body;
                main.innerText.substring(0, 500);
            """}
        }))
        response = json.loads(ws.recv())
        visible_text = response.get('result', {}).get('result', {}).get('value', '')
        
        print(f"\n📝 VISIBLE CONTENT:")
        print(f"   {visible_text[:300]}...")
        
        # Check for any buttons or actions available
        ws.send(json.dumps({
            "id": 7,
            "method": "Runtime.evaluate",
            "params": {"expression": """
                const buttons = Array.from(document.querySelectorAll('button')).map(btn => btn.innerText.trim()).filter(text => text.length > 0);
                JSON.stringify(buttons.slice(0, 5));
            """}
        }))
        response = json.loads(ws.recv())
        buttons = json.loads(response.get('result', {}).get('result', {}).get('value', '[]'))
        
        if buttons:
            print(f"\n🔘 AVAILABLE ACTIONS:")
            for button in buttons:
                print(f"   - {button}")
        
        ws.close()
        
        # Provide recommendations
        print("\n💡 RECOMMENDATIONS:")
        if status_info.get('identity_verification'):
            print("   - Complete identity verification process")
            print("   - Have government ID ready (passport, driver's license)")
        if status_info.get('document_upload'):
            print("   - Upload required documents")
        if status_info.get('pending_review'):
            print("   - Wait for Coinbase review (typically 1-3 business days)")
        if status_info.get('wait_time'):
            print("   - Verification in progress - check back later")
        
        print("\n⏰ TYPICAL VERIFICATION TIMES:")
        print("   - Basic verification: 5-10 minutes")
        print("   - Enhanced verification: 1-3 business days")
        print("   - Document review: 2-5 business days")
        
    except Exception as e:
        print(f"❌ Error checking status: {e}")

if __name__ == "__main__":
    check_coinbase_status()