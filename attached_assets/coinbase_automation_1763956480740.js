const { chromium } = require('playwright');
const fs = require('fs');
const readline = require('readline');

class CoinbaseAPIAutomator {
    constructor() {
        this.browser = null;
        this.page = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    async launch() {
        console.log('🚀 Launching Coinbase API automation...');
        
        this.browser = await chromium.launch({
            headless: false,
            slowMo: 1000
        });
        
        this.page = await this.browser.newPage();
        
        // Navigate to Coinbase Pro API page
        console.log('🌐 Navigating to Coinbase Pro API settings...');
        await this.page.goto('https://pro.coinbase.com/profile/api');
        
        // Wait for page load
        await this.page.waitForTimeout(3000);
        
        // Check if we need to login
        const currentUrl = this.page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('signin') || currentUrl.includes('login')) {
            console.log('🔐 LOGIN REQUIRED!');
            await this.handleLogin();
        } else {
            console.log('✅ Already logged in or at API page');
            await this.createAPIKey();
        }
    }

    async handleLogin() {
        console.log('🔑 Handling login process...');
        
        // Get credentials
        const email = await this.askQuestion('Enter your Coinbase email: ');
        const password = await this.askQuestion('Enter your Coinbase password: ');
        
        // Fill login form
        await this.page.fill('input[type="email"]', email);
        await this.page.fill('input[type="password"]', password);
        
        // Click login
        await this.page.click('button[type="submit"]');
        
        // Wait for potential 2FA or redirect
        await this.page.waitForTimeout(5000);
        
        // Check for 2FA
        const pageContent = await this.page.textContent('body');
        if (pageContent.includes('verification') || pageContent.includes('2FA')) {
            console.log('🔐 2FA Required');
            const code = await this.askQuestion('Enter your 2FA code: ');
            
            await this.page.fill('input[placeholder*="code"]', code);
            await this.page.click('button[type="submit"]');
            await this.page.waitForTimeout(3000);
        }
        
        // Navigate to API page after login
        await this.page.goto('https://pro.coinbase.com/profile/api');
        await this.page.waitForTimeout(3000);
        
        await this.createAPIKey();
    }

    async createAPIKey() {
        console.log('🔑 Creating new API key...');
        
        try {
            // Look for "New API Key" or similar button
            const newKeyButton = await this.page.locator('button:has-text("New API Key"), button:has-text("Create"), button:has-text("Add")').first();
            
            if (await newKeyButton.isVisible()) {
                await newKeyButton.click();
                await this.page.waitForTimeout(2000);
                
                // Set permissions
                console.log('⚙️ Setting API permissions...');
                
                // Check all permission boxes
                const checkboxes = await this.page.locator('input[type="checkbox"]').all();
                for (const checkbox of checkboxes) {
                    await checkbox.check();
                }
                
                // Set passphrase
                const passphrase = 'TaurusAI_Bitcoin_RWA_2025';
                const passphraseInput = await this.page.locator('input[placeholder*="passphrase"], input[type="password"]').first();
                
                if (await passphraseInput.isVisible()) {
                    await passphraseInput.fill(passphrase);
                }
                
                // Submit API key creation
                const submitButton = await this.page.locator('button:has-text("Create"), button:has-text("Submit"), button[type="submit"]').first();
                await submitButton.click();
                
                await this.page.waitForTimeout(3000);
                
                // Extract credentials
                await this.extractCredentials();
                
            } else {
                console.log('❌ Could not find API key creation button');
                // Take screenshot for debugging
                await this.page.screenshot({ path: '/tmp/coinbase_debug.png' });
                console.log('📸 Screenshot saved to /tmp/coinbase_debug.png');
            }
            
        } catch (error) {
            console.log(`❌ Error creating API key: ${error.message}`);
            await this.page.screenshot({ path: '/tmp/coinbase_error.png' });
        }
    }

    async extractCredentials() {
        console.log('📝 Extracting API credentials...');
        
        try {
            // Wait for credentials to appear
            await this.page.waitForTimeout(2000);
            
            // Try different selectors for API key and secret
            const possibleKeySelectors = [
                '[data-testid="api-key"]',
                '.api-key',
                'code:has-text("cb_")',
                'span:has-text("cb_")',
                'div:has-text("cb_")'
            ];
            
            const possibleSecretSelectors = [
                '[data-testid="api-secret"]',
                '.api-secret',
                'code',
                'textarea'
            ];
            
            let apiKey = null;
            let apiSecret = null;
            
            // Try to find API key
            for (const selector of possibleKeySelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        apiKey = await element.textContent();
                        if (apiKey && apiKey.includes('cb_')) {
                            break;
                        }
                    }
                } catch (e) {}
            }
            
            // Try to find API secret
            for (const selector of possibleSecretSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        const text = await element.textContent();
                        if (text && text.length > 30 && !text.includes('cb_')) {
                            apiSecret = text;
                            break;
                        }
                    }
                } catch (e) {}
            }
            
            const credentials = {
                api_key: apiKey,
                api_secret: apiSecret,
                passphrase: 'TaurusAI_Bitcoin_RWA_2025'
            };
            
            console.log('✅ CREDENTIALS EXTRACTED:');
            console.log(`API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : 'Not found'}`);
            
            if (apiKey && apiSecret) {
                await this.updateEnvironmentFile(credentials);
                console.log('🎉 SUCCESS! API keys configured for TAURUS AI Bitcoin RWA platform');
            } else {
                console.log('❌ Could not extract all credentials');
                await this.page.screenshot({ path: '/tmp/coinbase_extraction.png' });
            }
            
        } catch (error) {
            console.log(`❌ Error extracting credentials: ${error.message}`);
        }
    }

    async updateEnvironmentFile(credentials) {
        console.log('💾 Updating environment variables...');
        
        const envFile = '/Users/user/Documents/TAURUS AI Corp./CURSOR Projects/Taurus_OrionGrid/.env.production';
        
        try {
            let content = fs.readFileSync(envFile, 'utf8');
            
            // Replace placeholder values
            content = content.replace(
                'COINBASE_X402_API_KEY=your-coinbase-x402-key',
                `COINBASE_API_KEY=${credentials.api_key}`
            );
            content = content.replace(
                'COINBASE_X402_SECRET=your-coinbase-x402-secret',
                `COINBASE_API_SECRET=${credentials.api_secret}`
            );
            
            // Add passphrase if not exists
            if (!content.includes('COINBASE_PASSPHRASE')) {
                content += `\nCOINBASE_PASSPHRASE=${credentials.passphrase}\n`;
            }
            
            fs.writeFileSync(envFile, content);
            console.log('✅ Environment variables updated successfully!');
            
        } catch (error) {
            console.log(`❌ Error updating environment file: ${error.message}`);
        }
    }

    async close() {
        this.rl.close();
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run automation
async function main() {
    const automator = new CoinbaseAPIAutomator();
    
    try {
        await automator.launch();
    } catch (error) {
        console.log(`❌ Automation failed: ${error.message}`);
    } finally {
        await automator.close();
    }
}

main();