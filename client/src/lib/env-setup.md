# Replit Secrets Setup Guide for ASSETGRID™

## Add Your Hedera Credentials to Replit Secrets

1. **Open Replit Secrets**: Click the lock icon in the left sidebar
2. **Add these secrets**:

```
HEDERA_ACCOUNT_ID=0.0.6952220
HEDERA_PRIVATE_KEY=0x899d48f12259fbc60989441ce3608ea00e65b857d00296a6c3110a6392faedb0
HEDERA_NETWORK=testnet
```

## Accessing Secrets in Code

These will be available as environment variables:
- `process.env.HEDERA_ACCOUNT_ID`
- `process.env.HEDERA_PRIVATE_KEY`
- `process.env.HEDERA_NETWORK`

## Security Best Practices

- ✅ Keys stored encrypted in Replit Secrets
- ✅ Never commit .env files to git
- ✅ Rotate keys quarterly
- ✅ Use different keys for testnet/mainnet
- ✅ Audit all key access logs

## Account Info

- **Hedera Account**: 0.0.6952220 (ECDSA)
- **EVM Address**: 0xd0eac0e4a3f268313ba16fccfd6d4e6701d1c919
- **Network**: Hedera Mainnet/Testnet
- **Key Type**: ECDSA (256-bit)

## Testing Connection

1. Go to `/accounts` page
2. Select network (testnet/mainnet)
3. Paste credentials OR use Replit environment variables
4. Click "CONNECT ACCOUNT"
5. Check Command Center for balance and status
