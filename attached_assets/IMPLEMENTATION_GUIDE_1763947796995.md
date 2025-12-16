# TOKENIZED KYC - IMPLEMENTATION GUIDE

## TECHNICAL IMPLEMENTATION ROADMAP

---

## PHASE 0: PREREQUISITES (Week -1)

### Environment Setup

```bash
# Install dependencies
npm install -g truffle hardhat @openzeppelin/contracts
npm install web3 ethers ipfs-http-client circomlib snarkjs

# Clone existing Aadhaar integration
cd /backend/kyc-service/
ls uidai-aadhaar/  # Verify existing integration

# Setup Polygon Mumbai testnet
export POLYGON_RPC="https://rpc-mumbai.maticvigil.com"
export PRIVATE_KEY="your_deployment_key"

# Setup IPFS node
docker run -d -p 5001:5001 ipfs/kubo:latest

# Install ZK proof tools
git clone https://github.com/iden3/circom.git
cd circom && cargo build --release
```

### Required Accounts
- [ ] Polygon Mumbai testnet wallet (funded with test MATIC)
- [ ] UIDAI API credentials (existing)
- [ ] DigiLocker API credentials (register at digilocker.gov.in)
- [ ] CKYC API access (apply through RBI)
- [ ] IPFS/Filecoin account

---

## PHASE 1: SMART CONTRACT DEVELOPMENT (Week 1-2)

### Step 1.1: Project Structure

```bash
mkdir -p blockchain/contracts blockchain/test blockchain/scripts
cd blockchain

# Initialize Hardhat project
npx hardhat init

# Project structure
blockchain/
├── contracts/
│   ├── KYCIssuance.sol
│   ├── KYCVerification.sol
│   ├── ConsentManagement.sol
│   ├── KYCRevocation.sol
│   ├── KYCDelegation.sol
│   └── interfaces/
│       └── IKYC.sol
├── test/
│   ├── KYCIssuance.test.js
│   ├── KYCVerification.test.js
│   └── integration.test.js
├── scripts/
│   ├── deploy.js
│   └── verify.js
└── hardhat.config.js
```

### Step 1.2: Deploy KYCIssuance Contract

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // Deploy KYCIssuance
  const KYCIssuance = await ethers.getContractFactory("KYCIssuance");
  const kycIssuance = await KYCIssuance.deploy();
  await kycIssuance.deployed();
  console.log("KYCIssuance deployed to:", kycIssuance.address);

  // Deploy KYCVerification
  const KYCVerification = await ethers.getContractFactory("KYCVerification");
  const kycVerification = await KYCVerification.deploy(kycIssuance.address);
  await kycVerification.deployed();
  console.log("KYCVerification deployed to:", kycVerification.address);

  // Deploy ConsentManagement
  const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
  const consentManagement = await ConsentManagement.deploy();
  await consentManagement.deployed();
  console.log("ConsentManagement deployed to:", consentManagement.address);

  // Deploy KYCRevocation
  const KYCRevocation = await ethers.getContractFactory("KYCRevocation");
  const kycRevocation = await KYCRevocation.deploy(kycIssuance.address);
  await kycRevocation.deployed();
  console.log("KYCRevocation deployed to:", kycRevocation.address);

  // Save addresses
  const addresses = {
    kycIssuance: kycIssuance.address,
    kycVerification: kycVerification.address,
    consentManagement: consentManagement.address,
    kycRevocation: kycRevocation.address,
    network: "polygon-mumbai",
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### Step 1.3: Run Tests

```javascript
// test/KYCIssuance.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KYCIssuance", function () {
  let kycIssuance;
  let owner;
  let holder;

  beforeEach(async function () {
    [owner, holder] = await ethers.getSigners();
    const KYCIssuance = await ethers.getContractFactory("KYCIssuance");
    kycIssuance = await KYCIssuance.deploy();
    await kycIssuance.deployed();

    // Grant issuer role to owner
    const ISSUER_ROLE = await kycIssuance.ISSUER_ROLE();
    await kycIssuance.grantRole(ISSUER_ROLE, owner.address);
  });

  it("Should issue a credential", async function () {
    const credentialHash = ethers.utils.id("test-credential");
    const did = "did:polygon:0x123456";

    const tx = await kycIssuance.issueCredential(
      holder.address,
      did,
      credentialHash,
      3, // FULL_KYC
      365, // validity days
      "AADHAAR_BIOMETRIC",
      "QmTest123..."
    );

    await tx.wait();

    const credential = await kycIssuance.getCredential(credentialHash);
    expect(credential.holder).to.equal(holder.address);
    expect(credential.kycLevel).to.equal(3);
    expect(credential.active).to.be.true;
  });

  it("Should validate credential expiry", async function () {
    const credentialHash = ethers.utils.id("test-credential");

    // Issue credential with 0 days validity
    await kycIssuance.issueCredential(
      holder.address,
      "did:polygon:0x123456",
      credentialHash,
      3,
      0, // expires immediately
      "AADHAAR_BIOMETRIC",
      "QmTest123..."
    );

    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
    await ethers.provider.send("evm_mine");

    const isValid = await kycIssuance.isValid(credentialHash);
    expect(isValid).to.be.false;
  });

  it("Should prevent duplicate credential issuance", async function () {
    const credentialHash = ethers.utils.id("test-credential");

    await kycIssuance.issueCredential(
      holder.address,
      "did:polygon:0x123456",
      credentialHash,
      3,
      365,
      "AADHAAR_BIOMETRIC",
      "QmTest123..."
    );

    // Attempt duplicate issuance
    await expect(
      kycIssuance.issueCredential(
        holder.address,
        "did:polygon:0x123456",
        credentialHash,
        3,
        365,
        "AADHAAR_BIOMETRIC",
        "QmTest123..."
      )
    ).to.be.revertedWith("Credential already exists");
  });
});

// Run tests
// npx hardhat test --network mumbai
```

### Step 1.4: Deploy to Mumbai Testnet

```bash
# hardhat.config.js configuration
module.exports = {
  solidity: "0.8.19",
  networks: {
    mumbai: {
      url: process.env.POLYGON_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};

# Deploy
npx hardhat run scripts/deploy.js --network mumbai

# Verify on PolygonScan
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

---

## PHASE 2: ZK PROOF CIRCUITS (Week 2-3)

### Step 2.1: Age Verification Circuit

```circom
// circuits/ageVerification.circom
pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template AgeVerification() {
    // Private inputs
    signal input dateOfBirth;  // Format: YYYYMMDD as integer
    signal input salt;         // Random salt for privacy

    // Public inputs
    signal input currentDate;  // Format: YYYYMMDD as integer
    signal input minAge;       // Minimum age required

    // Output
    signal output isValid;

    // Calculate age in years
    component ageCalc = CalculateAge();
    ageCalc.dob <== dateOfBirth;
    ageCalc.current <== currentDate;

    // Check if age >= minAge
    component gte = GreaterEqThan(8);
    gte.in[0] <== ageCalc.age;
    gte.in[1] <== minAge;

    isValid <== gte.out;
}

template CalculateAge() {
    signal input dob;
    signal input current;
    signal output age;

    // Extract year from dates
    component dobYear = ExtractYear();
    dobYear.date <== dob;

    component currentYear = ExtractYear();
    currentYear.date <== current;

    // Calculate age
    age <== currentYear.year - dobYear.year;
}

template ExtractYear() {
    signal input date;  // YYYYMMDD
    signal output year;

    year <== date \ 10000;  // Integer division
}

component main {public [currentDate, minAge]} = AgeVerification();
```

### Step 2.2: Compile and Generate Keys

```bash
# Compile circuit
circom circuits/ageVerification.circom --r1cs --wasm --sym -o build/

# Generate proving and verification keys
cd build/ageVerification
snarkjs groth16 setup ageVerification.r1cs pot12_final.ptau ageVerification_0000.zkey

# Generate final zkey (phase 2 - contribute randomness)
snarkjs zkey contribute ageVerification_0000.zkey ageVerification_final.zkey \
  --name="TAURUS AI Contribution" -v

# Export verification key
snarkjs zkey export verificationkey ageVerification_final.zkey verification_key.json

# Export Solidity verifier
snarkjs zkey export solidityverifier ageVerification_final.zkey AgeVerifier.sol
```

### Step 2.3: ZK Proof Generator Service

```javascript
// backend/services/zkProofGenerator.js
const snarkjs = require("snarkjs");
const fs = require("fs");

class ZKProofGenerator {
  constructor() {
    this.circuits = {
      ageVerification: {
        wasm: "build/ageVerification/ageVerification.wasm",
        zkey: "build/ageVerification/ageVerification_final.zkey",
        vkey: "build/ageVerification/verification_key.json"
      },
      incomeRange: {
        wasm: "build/incomeRange/incomeRange.wasm",
        zkey: "build/incomeRange/incomeRange_final.zkey",
        vkey: "build/incomeRange/verification_key.json"
      },
      locationMembership: {
        wasm: "build/locationMembership/locationMembership.wasm",
        zkey: "build/locationMembership/locationMembership_final.zkey",
        vkey: "build/locationMembership/verification_key.json"
      }
    };
  }

  async generateAgeProof(dateOfBirth, minAge) {
    const input = {
      dateOfBirth: this.dateToInteger(dateOfBirth),
      currentDate: this.dateToInteger(new Date()),
      minAge: minAge,
      salt: Math.floor(Math.random() * 1000000000)
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      this.circuits.ageVerification.wasm,
      this.circuits.ageVerification.zkey
    );

    return {
      proof: proof,
      publicSignals: publicSignals,
      proofType: "AGE_VERIFICATION"
    };
  }

  async verifyAgeProof(proof, publicSignals) {
    const vkey = JSON.parse(
      fs.readFileSync(this.circuits.ageVerification.vkey)
    );

    const verified = await snarkjs.groth16.verify(
      vkey,
      publicSignals,
      proof
    );

    return verified;
  }

  async generateIncomeProof(actualIncome, minIncome) {
    const input = {
      income: actualIncome,
      minIncome: minIncome,
      salt: Math.floor(Math.random() * 1000000000)
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      this.circuits.incomeRange.wasm,
      this.circuits.incomeRange.zkey
    );

    return {
      proof: proof,
      publicSignals: publicSignals,
      proofType: "INCOME_RANGE"
    };
  }

  async generateLocationProof(fullAddress, allowedStates) {
    const state = this.extractState(fullAddress);
    const stateHash = this.hash(state);

    // Create Merkle tree
    const merkleTree = this.createMerkleTree(
      allowedStates.map(s => this.hash(s))
    );

    const merkleProof = merkleTree.getProof(stateHash);

    const input = {
      stateHash: stateHash,
      merkleRoot: merkleTree.getRoot(),
      merkleProof: merkleProof.map(p => p.data)
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      this.circuits.locationMembership.wasm,
      this.circuits.locationMembership.zkey
    );

    return {
      proof: proof,
      publicSignals: publicSignals,
      proofType: "LOCATION_MEMBERSHIP"
    };
  }

  // Helper functions
  dateToInteger(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return parseInt(`${year}${month}${day}`);
  }

  extractState(address) {
    // Extract state from address object
    return address.state || address.STATE;
  }

  hash(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data.toString()).digest('hex');
  }

  createMerkleTree(leaves) {
    const { MerkleTree } = require('merkletreejs');
    const SHA256 = require('crypto-js/sha256');
    return new MerkleTree(leaves, SHA256);
  }
}

module.exports = ZKProofGenerator;
```

---

## PHASE 3: BACKEND SERVICES (Week 3-5)

### Step 3.1: Credential Issuance Service

```javascript
// backend/services/credentialIssuer.js
const { create } = require("ipfs-http-client");
const crypto = require("crypto");
const { ethers } = require("ethers");

class CredentialIssuer {
  constructor(config) {
    this.ipfs = create({ url: config.ipfsUrl });
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.kycContract = new ethers.Contract(
      config.contractAddress,
      config.contractAbi,
      this.wallet
    );
  }

  async issueFromAadhaar(aadhaarData, authCode) {
    // Step 1: Generate DID
    const did = await this.generateDID();

    // Step 2: Create credential structure
    const credential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://QUANTUM_RUPEE (Q₹).gov.in/credentials/kyc/v1"
      ],
      id: `https://QUANTUM_RUPEE (Q₹).gov.in/credentials/kyc/${Date.now()}`,
      type: ["VerifiableCredential", "KYCCredential"],
      issuer: {
        id: "did:ethr:" + this.wallet.address,
        name: "TAURUS AI KYC Authority"
      },
      issuanceDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      credentialSubject: {
        id: did,
        kycLevel: "FULL_KYC",
        verificationMethod: "AADHAAR_BIOMETRIC",
        attributes: {
          name: await this.encrypt(aadhaarData.name),
          aadhaarLastFour: aadhaarData.aadhaarNumber.slice(-4),
          dateOfBirth: await this.encrypt(aadhaarData.dob),
          gender: aadhaarData.gender,
          address: await this.encrypt(JSON.stringify(aadhaarData.address)),
          mobile: await this.encrypt(aadhaarData.mobile),
          email: await this.encrypt(aadhaarData.email),
          biometricHash: this.hashBiometric(aadhaarData.biometric)
        },
        authenticationDetails: {
          authCode: authCode,
          timestamp: new Date().toISOString()
        }
      }
    };

    // Step 3: Generate ZK proofs
    const zkProofs = await this.generateZKProofs(aadhaarData);
    credential.credentialSubject.zkProofs = zkProofs;

    // Step 4: Sign credential
    const signedCredential = await this.signCredential(credential);

    // Step 5: Store on IPFS
    const ipfsHash = await this.storeOnIPFS(signedCredential);

    // Step 6: Register on blockchain
    const credentialHash = this.hashCredential(signedCredential);
    const tx = await this.kycContract.issueCredential(
      did,
      did,
      credentialHash,
      3, // FULL_KYC
      3650, // 10 years
      "AADHAAR_BIOMETRIC",
      ipfsHash
    );

    await tx.wait();

    return {
      did: did,
      credential: signedCredential,
      ipfsHash: ipfsHash,
      credentialHash: credentialHash,
      transactionHash: tx.hash
    };
  }

  async generateDID() {
    // Generate new Ethereum key pair
    const wallet = ethers.Wallet.createRandom();
    return `did:polygon:${wallet.address}`;
  }

  async encrypt(data) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted,
      key: key.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: algorithm
    };
  }

  async decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      encryptedData.algorithm,
      Buffer.from(encryptedData.key, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  hashBiometric(biometricData) {
    return crypto
      .pbkdf2Sync(biometricData, 'QUANTUM_RUPEE (Q₹)-salt', 10000, 64, 'sha256')
      .toString('hex');
  }

  async generateZKProofs(aadhaarData) {
    const zkGen = new (require('./zkProofGenerator'))();

    const ageProof = await zkGen.generateAgeProof(aadhaarData.dob, 18);
    const locationProof = await zkGen.generateLocationProof(
      aadhaarData.address,
      ['MAHARASHTRA', 'DELHI', 'KARNATAKA']
    );

    return {
      ageProof: ageProof,
      locationProof: locationProof
    };
  }

  async signCredential(credential) {
    const message = JSON.stringify(credential);
    const signature = await this.wallet.signMessage(message);

    credential.proof = {
      type: "EcdsaSecp256k1Signature2019",
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: `did:ethr:${this.wallet.address}#keys-1`,
      jws: signature
    };

    return credential;
  }

  async storeOnIPFS(credential) {
    const { cid } = await this.ipfs.add(JSON.stringify(credential));
    return cid.toString();
  }

  hashCredential(credential) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(credential))
      .digest('hex');
  }
}

module.exports = CredentialIssuer;
```

### Step 3.2: Integration with Existing Aadhaar Service

```javascript
// backend/routes/kyc.js
const express = require('express');
const router = express.Router();

// Import existing Aadhaar service
const AadhaarService = require('../kyc-service/uidai-aadhaar/aadhaar-auth');

// Import new credential issuer
const CredentialIssuer = require('../services/credentialIssuer');

const aadhaarService = new AadhaarService({
  uidaiUrl: process.env.UIDAI_API_URL,
  licenseKey: process.env.UIDAI_LICENSE_KEY
});

const credentialIssuer = new CredentialIssuer({
  ipfsUrl: process.env.IPFS_URL,
  rpcUrl: process.env.POLYGON_RPC_URL,
  privateKey: process.env.ISSUER_PRIVATE_KEY,
  contractAddress: process.env.KYC_CONTRACT_ADDRESS,
  contractAbi: require('../contracts/KYCIssuance.json').abi
});

// POST /api/kyc/issue-from-aadhaar
router.post('/issue-from-aadhaar', async (req, res) => {
  try {
    const { aadhaarNumber, biometricData, deviceInfo } = req.body;

    // Step 1: Authenticate with UIDAI (existing service)
    const aadhaarAuth = await aadhaarService.authenticateBiometric({
      aadhaarNumber: aadhaarNumber,
      biometric: biometricData,
      deviceInfo: deviceInfo
    });

    if (aadhaarAuth.status !== 'SUCCESS') {
      return res.status(401).json({
        error: 'Aadhaar authentication failed',
        details: aadhaarAuth.error
      });
    }

    // Step 2: Issue credential (new service)
    const credential = await credentialIssuer.issueFromAadhaar(
      aadhaarAuth.userData,
      aadhaarAuth.authCode
    );

    // Step 3: Return credential to user
    res.json({
      success: true,
      did: credential.did,
      credentialHash: credential.credentialHash,
      ipfsHash: credential.ipfsHash,
      transactionHash: credential.transactionHash,
      credential: credential.credential
    });

  } catch (error) {
    console.error('KYC issuance error:', error);
    res.status(500).json({
      error: 'Credential issuance failed',
      details: error.message
    });
  }
});

// POST /api/kyc/verify
router.post('/verify', async (req, res) => {
  try {
    const { credentialHash, requestedFields } = req.body;

    // Call verification contract
    const verification = await credentialIssuer.kycContract.quickVerify(
      credentialHash
    );

    res.json({
      valid: verification.valid,
      kycLevel: verification.kycLevel,
      requestedFields: requestedFields // In production, fetch from IPFS based on consent
    });

  } catch (error) {
    console.error('KYC verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      details: error.message
    });
  }
});

module.exports = router;
```

---

## PHASE 4: FRONTEND (Week 5-7)

### Step 4.1: Mobile App Setup

```bash
# Create React Native project
npx react-native init QUANTUM_RUPEE (Q₹)KYC
cd QUANTUM_RUPEE (Q₹)KYC

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-biometrics react-native-qrcode-svg
npm install ethers ipfs-http-client
npm install @react-native-async-storage/async-storage

# iOS specific
cd ios && pod install && cd ..
```

### Step 4.2: KYC Issuance Screen

```javascript
// src/screens/KYCIssuanceScreen.js
import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import BiometricAuth from '../services/BiometricAuth';
import AadhaarService from '../services/AadhaarService';
import CredentialService from '../services/CredentialService';

const KYCIssuanceScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('INIT');

  const handleAadhaarKYC = async () => {
    try {
      setLoading(true);
      setStep('BIOMETRIC_CAPTURE');

      // Step 1: Capture biometric
      const biometric = await BiometricAuth.captureFingerprint();

      setStep('AADHAAR_AUTH');

      // Step 2: Authenticate with Aadhaar
      const aadhaarData = await AadhaarService.authenticate({
        aadhaarNumber: '1234-5678-9012',
        biometric: biometric
      });

      setStep('CREDENTIAL_ISSUANCE');

      // Step 3: Issue credential
      const credential = await CredentialService.issueCredential(aadhaarData);

      setStep('COMPLETE');

      // Navigate to success screen
      navigation.navigate('Success', { credential });

    } catch (error) {
      console.error('KYC issuance failed:', error);
      alert('KYC issuance failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Create KYC Token
      </Text>

      {!loading && (
        <>
          <Button
            title="Aadhaar Biometric KYC (Recommended)"
            onPress={handleAadhaarKYC}
          />

          <Button
            title="Import from DigiLocker"
            onPress={() => navigation.navigate('DigiLockerImport')}
          />

          <Button
            title="Use Existing CKYC"
            onPress={() => navigation.navigate('CKYCImport')}
          />
        </>
      )}

      {loading && (
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 20 }}>
            {step === 'BIOMETRIC_CAPTURE' && 'Capturing biometric...'}
            {step === 'AADHAAR_AUTH' && 'Authenticating with UIDAI...'}
            {step === 'CREDENTIAL_ISSUANCE' && 'Issuing credential...'}
            {step === 'COMPLETE' && 'Complete!'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default KYCIssuanceScreen;
```

---

## PHASE 5: TESTING & PILOT (Week 7-8)

### Step 5.1: Integration Testing

```javascript
// test/integration.test.js
const { expect } = require("chai");
const AadhaarService = require("../backend/kyc-service/uidai-aadhaar/aadhaar-auth");
const CredentialIssuer = require("../backend/services/credentialIssuer");

describe("End-to-End KYC Issuance", function () {
  this.timeout(60000); // 60 second timeout

  it("Should complete full KYC flow", async function () {
    // Step 1: Mock Aadhaar authentication
    const aadhaarService = new AadhaarService({ /* config */ });
    const aadhaarAuth = await aadhaarService.authenticateBiometric({
      aadhaarNumber: "xxxx-xxxx-8374",
      biometric: "mock-biometric-data",
      deviceInfo: { model: "STARTEK_FM220" }
    });

    expect(aadhaarAuth.status).to.equal("SUCCESS");

    // Step 2: Issue credential
    const credentialIssuer = new CredentialIssuer({ /* config */ });
    const credential = await credentialIssuer.issueFromAadhaar(
      aadhaarAuth.userData,
      aadhaarAuth.authCode
    );

    expect(credential.did).to.match(/^did:polygon:0x[a-fA-F0-9]{40}$/);
    expect(credential.credentialHash).to.be.a('string');
    expect(credential.ipfsHash).to.be.a('string');

    // Step 3: Verify on blockchain
    const valid = await credentialIssuer.kycContract.isValid(
      credential.credentialHash
    );

    expect(valid).to.be.true;

    console.log("✅ End-to-end test passed!");
    console.log("DID:", credential.did);
    console.log("Credential Hash:", credential.credentialHash);
    console.log("IPFS Hash:", credential.ipfsHash);
  });
});
```

### Step 5.2: Performance Testing

```bash
# Load testing with Artillery
npm install -g artillery

# artillery.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "Issue KYC Credential"
    flow:
      - post:
          url: "/api/kyc/issue-from-aadhaar"
          json:
            aadhaarNumber: "{{ $randomString() }}"
            biometricData: "mock-biometric"
            deviceInfo:
              model: "STARTEK_FM220"

# Run test
artillery run artillery.yml
```

---

## PHASE 6: DEPLOYMENT (Week 9-12)

### Step 6.1: Production Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - UIDAI_API_URL=${UIDAI_API_URL}
      - POLYGON_RPC_URL=https://polygon-rpc.com
      - IPFS_URL=https://ipfs.infura.io:5001
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=QUANTUM_RUPEE (Q₹)
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  ipfs:
    image: ipfs/kubo:latest
    ports:
      - "4001:4001"
      - "5001:5001"
      - "8080:8080"
    volumes:
      - ipfs-data:/data/ipfs

volumes:
  postgres-data:
  ipfs-data:
```

### Step 6.2: Monitoring Setup

```javascript
// backend/monitoring/metrics.js
const prometheus = require('prom-client');

const register = new prometheus.Registry();

// Metrics
const kycIssuanceCounter = new prometheus.Counter({
  name: 'kyc_issuance_total',
  help: 'Total number of KYC credentials issued',
  labelNames: ['verification_method']
});

const kycIssuanceDuration = new prometheus.Histogram({
  name: 'kyc_issuance_duration_seconds',
  help: 'Duration of KYC issuance in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const kycVerificationCounter = new prometheus.Counter({
  name: 'kyc_verification_total',
  help: 'Total number of KYC verifications',
  labelNames: ['institution', 'result']
});

register.registerMetric(kycIssuanceCounter);
register.registerMetric(kycIssuanceDuration);
register.registerMetric(kycVerificationCounter);

module.exports = {
  register,
  kycIssuanceCounter,
  kycIssuanceDuration,
  kycVerificationCounter
};
```

---

## DEPLOYMENT CHECKLIST

### Pre-Production
- [ ] All smart contracts audited by OpenZeppelin
- [ ] Load testing completed (1000 req/sec)
- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] RBI sandbox approval obtained
- [ ] UIDAI production API access granted
- [ ] DigiLocker production API access granted

### Production Deployment
- [ ] Deploy smart contracts to Polygon mainnet
- [ ] Configure IPFS with Filecoin pinning
- [ ] Setup monitoring (Prometheus + Grafana)
- [ ] Configure alerting (PagerDuty)
- [ ] Setup backup and disaster recovery
- [ ] Configure CDN for mobile app
- [ ] Launch marketing campaign

### Post-Deployment
- [ ] Monitor system health 24/7
- [ ] Track key metrics (issuance time, verification time)
- [ ] Collect user feedback
- [ ] Iterate based on pilot results
- [ ] Prepare for scale (50K → 500K users)

---

## TROUBLESHOOTING

### Common Issues

**Issue**: Smart contract deployment fails
**Solution**: Check gas price, ensure sufficient MATIC balance

**Issue**: IPFS upload times out
**Solution**: Use Infura IPFS gateway or local IPFS node

**Issue**: ZK proof generation takes too long
**Solution**: Use GPU acceleration or precompute common proofs

**Issue**: Aadhaar API authentication fails
**Solution**: Verify UIDAI license key, check device compatibility

---

## SUPPORT

For technical support during implementation:
- **Email**: dev@QUANTUM_RUPEE (Q₹).gov.in
- **Slack**: QUANTUM_RUPEE (Q₹)-dev.slack.com
- **GitHub**: github.com/taurus-ai/QUANTUM_RUPEE (Q₹)-kyc
- **Docs**: docs.QUANTUM_RUPEE (Q₹).gov.in

---

**Document Version**: 1.0
**Last Updated**: 2024-10-29
**Classification**: INTERNAL - Implementation Guide
