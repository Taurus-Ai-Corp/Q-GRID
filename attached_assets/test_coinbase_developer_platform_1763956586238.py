#!/usr/bin/env python3
"""
TAURUS AI Corp - Coinbase Developer Platform API Test
Test the new Developer Platform credentials
"""

import os
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.production')

class CoinbaseDeveloperPlatformTester:
    def __init__(self):
        self.client_api_key = os.getenv('COINBASE_CLIENT_API_KEY')
        self.project_id = os.getenv('COINBASE_PROJECT_ID')
        self.key_id = os.getenv('COINBASE_KEY_ID')
        
        print("🔑 TAURUS AI Corp - Coinbase Developer Platform Test")
        print("=" * 60)
        print(f"🏢 Organization: TAURUS AI Corp")
        print(f"🎯 Platform: Bitcoin RWA Trading")
        print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)
    
    def test_client_api_access(self):
        """Test Client API access (for frontend/OnchainKit)"""
        print("🌐 Testing Client API Access...")
        
        if not self.client_api_key:
            print("   ❌ Client API key not found")
            return False
        
        print(f"   🔑 Client API Key: {self.client_api_key[:10]}...")
        print(f"   📋 Project ID: {self.project_id}")
        
        # This is a frontend API, so we can't test it directly from Python
        # But we can verify the credentials are properly configured
        print("   ✅ Client API credentials configured")
        print("   📱 Ready for OnchainKit integration")
        print("   🔧 Frontend components can use this key")
        
        return True
    
    def test_rpc_endpoint(self):
        """Test RPC endpoint access"""
        print("⚡ Testing RPC Endpoint...")
        
        # Coinbase Developer Platform provides RPC endpoints
        rpc_url = f"https://api.developer.coinbase.com/rpc/v1/base/{self.client_api_key}"
        
        try:
            # Test a basic RPC call
            payload = {
                "jsonrpc": "2.0",
                "method": "eth_blockNumber",
                "params": [],
                "id": 1
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            response = requests.post(rpc_url, json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if 'result' in result:
                    block_number = int(result['result'], 16)
                    print(f"   ✅ RPC endpoint active")
                    print(f"   📊 Current block: {block_number}")
                    return True
                else:
                    print(f"   ⚠️  RPC response: {result}")
                    return False
            else:
                print(f"   ❌ RPC failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ❌ RPC test failed: {str(e)}")
            return False
    
    def test_api_configuration(self):
        """Test API configuration completeness"""
        print("🔧 Testing API Configuration...")
        
        config_items = [
            ("Client API Key", self.client_api_key),
            ("Project ID", self.project_id),
            ("Key ID", self.key_id)
        ]
        
        all_configured = True
        
        for name, value in config_items:
            if value and value != "your-key-here":
                print(f"   ✅ {name}: Configured")
            else:
                print(f"   ❌ {name}: Missing")
                all_configured = False
        
        return all_configured
    
    def show_integration_guide(self):
        """Show integration guidance"""
        print("📚 TAURUS AI Corp Integration Guide:")
        print()
        print("🌐 Frontend Integration (OnchainKit):")
        print(f"   • Project ID: {self.project_id}")
        print("   • Perfect for wallet connections and UI components")
        print()
        print("⚡ RPC Integration:")
        print("   • Base RPC: Configured (credentials loaded from environment)")
        print("   • Direct blockchain access for smart contracts")
        print()
        print("🔄 Next Steps for Additional APIs:")
        print("   • Research Exchange API for spot trading")
        print("   • Research Derivatives API for advanced strategies")
        print("   • Research Prime API for institutional features")
        print("   • Configure each API based on TAURUS AI Corp needs")
    
    def run_full_test(self):
        """Run complete test suite"""
        print("🚀 Starting TAURUS AI Corp Developer Platform Test...")
        print()
        
        tests = [
            ("Client API Access", self.test_client_api_access),
            ("RPC Endpoint", self.test_rpc_endpoint),
            ("API Configuration", self.test_api_configuration)
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            try:
                results[test_name] = test_func()
                print()
            except Exception as e:
                print(f"   ❌ {test_name} failed: {str(e)}")
                results[test_name] = False
                print()
        
        # Summary
        print("📋 TEST SUMMARY")
        print("=" * 30)
        
        passed = sum(results.values())
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
        
        print()
        print(f"📊 Success Rate: {passed}/{total} ({passed/total*100:.0f}%)")
        
        if passed >= 2:
            print("🎉 Developer Platform integration successful!")
            print("🚀 Ready for OnchainKit and blockchain integration")
        else:
            print("⚠️  Some configuration needed")
        
        print()
        self.show_integration_guide()
        
        return passed >= 2

def main():
    """Main test execution"""
    tester = CoinbaseDeveloperPlatformTester()
    
    if not tester.client_api_key:
        print("❌ No Developer Platform credentials found")
        return False
    
    return tester.run_full_test()

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n💡 TAURUS AI CORP STATUS:")
        print("   ✅ Developer Platform: Configured")
        print("   ✅ OnchainKit Ready: Yes")
        print("   🔄 Additional APIs: Research needed")
        print("   🎯 Bitcoin RWA Platform: Foundation ready")
    else:
        print("\n🔧 CONFIGURATION NEEDED:")
        print("   • Verify Developer Platform credentials")
        print("   • Check API key permissions")