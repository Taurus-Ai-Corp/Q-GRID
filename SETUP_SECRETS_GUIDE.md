# Setting Up Replit Secrets - Quick Guide

## Your ED25519 Hedera Account Credentials

### Step 1: Open Replit Secrets
1. Look for the **lock icon 🔒** in the left sidebar of Replit
2. Click it to open the Secrets manager

### Step 2: Add Each Secret
Click "New Secret" and add these four key-value pairs:

#### Secret 1: Account ID
- **Key:** `VITE_HEDERA_ACCOUNT_ID`
- **Value:** `0.0.7231851`

#### Secret 2: Private Key
- **Key:** `VITE_HEDERA_PRIVATE_KEY`
- **Value:** `0x0242d9566016bd0b19dc564df257fe816bb29cbb73bd3fb129afa451b71c0398`

#### Secret 3: Network
- **Key:** `VITE_HEDERA_NETWORK`
- **Value:** `testnet`

#### Secret 4: API Token
- **Key:** `VITE_HEDERA_API_TOKEN`
- **Value:** `v4.public.eyJzdWIiOiI0M2FjMDNkMi1hMjQ2LTExZjAtOTBmMy03Zjg4MTljZmYyMjgiLCJpYXQiOiIyMDI1LTExLTI0VDAxOjUyOjM4LjkyMloiLCJqdGkiOiI0MWIyOTdlYS1jOGQ4LTExZjAtODY2MS1lNzY5MmM5MjliZWUifUTQyWNacBa3k3a2QUEOgbyaedbcco9qM0BS-MiV8o5ScE3XS_6dCAJmip_Z5oFixYN9j2fzyvJupSHZah275Qc`

### Step 3: Verify Setup
1. Go to `/setup` page - you'll see all your secrets displayed
2. Go to `/accounts` page - click "CONNECT ACCOUNT"
3. Your Hedera account details should load automatically from environment variables

### Step 4: Test It Works
- Navigate to `/command-center` to see your account balance
- Go to `/monitoring` to track blockchain transactions
- Use `/kyc-service`, `/cbdc-service`, `/fraud-service` for the multi-service platform

---

## Important Security Notes
- ✅ These secrets are now in your Replit Secrets (encrypted)
- ✅ Never commit them to Git
- ✅ The `VITE_` prefix makes them accessible to the frontend (Vite automatically exposes them as `import.meta.env.*`)
- ✅ After setting secrets, restart the app for changes to take effect

## Account Details
- **Account ID:** 0.0.7231851
- **Key Type:** ED25519 (Post-Quantum Ready)
- **Network:** Hedera Testnet
- **Public Key:** 67971f5c7603d9c0c2ce2728fe0c98e5cad256284d0913f478e5d11e5cdcc43f
