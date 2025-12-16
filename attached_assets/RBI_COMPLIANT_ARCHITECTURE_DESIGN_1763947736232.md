# RBI-Compliant Architecture Design for TAURUS AI FinTech Platforms

## Document Control
- **Version**: 1.0
- **Date**: 2025-11-06
- **Classification**: Internal - Strategic
- **Owner**: TAURUS AI Corp - Infrastructure & Compliance Team

---

## Executive Summary

This document outlines the **RBI-compliant, DPDP Act-aligned** reference architecture for TAURUS AI fintech platforms (AssetGrid, ORIONGRID, BizFlow Financial Services). The architecture ensures:

- ✅ 100% data residency compliance for Indian financial data
- ✅ Real-time disaster recovery with <15 minute RPO/RTO
- ✅ Automated compliance monitoring and audit trails
- ✅ Scalable infrastructure supporting $17M+ revenue operations
- ✅ Zero-downtime migration capability

**Estimated Implementation Cost**: ₹45-65 lakhs (initial) + ₹12-18 lakhs/month (operational)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         TAURUS AI FINTECH ECOSYSTEM                        │
│                     (RBI & DPDP Act Compliant Architecture)                │
└───────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER (Multi-Region CDN)                                    │
│  ├── AssetGrid (Crypto Trading Platform)                                │
│  ├── ORIONGRID (RWA Tokenization Platform)                             │
│  └── BizFlow Financial Services (Enterprise Fintech)                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│   INDIA PRIMARY DATA CENTER      │   │  INDIA DR DATA CENTER           │
│   AWS Mumbai (ap-south-1)        │   │  Azure India Central            │
│   Location: Mumbai, Maharashtra  │   │  Location: Pune, Maharashtra    │
│                                  │   │                                 │
│  ┌────────────────────────────┐ │   │  ┌────────────────────────────┐│
│  │ API Gateway Layer          │ │   │  │ Standby Gateway            ││
│  │ - Rate Limiting            │ │   │  │ - Hot Standby Mode         ││
│  │ - Authentication (IAM)     │ │   │  │ - Auto-failover <60s       ││
│  │ - Request Routing          │ │   │  └────────────────────────────┘│
│  └────────────────────────────┘ │   │                                 │
│                                  │   │  ┌────────────────────────────┐│
│  ┌────────────────────────────┐ │   │  │ Replicated Application     ││
│  │ Application Tier (EKS)     │ │◄──┼──┤ - Kubernetes Cluster       ││
│  │ - Microservices (Pods)     │ │   │  │ - Passive Mode             ││
│  │ - Auto-scaling Groups      │ │   │  └────────────────────────────┘│
│  │ - Service Mesh (Istio)     │ │   │                                 │
│  └────────────────────────────┘ │   │  ┌────────────────────────────┐│
│                                  │   │  │ Database Replicas          ││
│  ┌────────────────────────────┐ │   │  │ - PostgreSQL (Read Only)   ││
│  │ Data Layer                 │ │   │  │ - MongoDB (Secondary)      ││
│  │ ┌──────────────────────┐  │ │   │  │ - Redis (Replica)          ││
│  │ │ PostgreSQL (Primary) │  │ │   │  └────────────────────────────┘│
│  │ │ - Financial Records  │  │ │   │                                 │
│  │ │ - Transaction Data   │  │◄──┼──┤ Continuous Replication         │
│  │ │ - KYC/Customer Data  │  │ │   │ - RPO: <5 minutes              │
│  │ └──────────────────────┘  │ │   │ - RTO: <15 minutes             │
│  │                            │ │   │                                 │
│  │ ┌──────────────────────┐  │ │   │  ┌────────────────────────────┐│
│  │ │ MongoDB (Sharded)    │  │ │   │  │ Backup Storage             ││
│  │ │ - User Profiles      │  │ │   │  │ - Encrypted Snapshots      ││
│  │ │ - Session Data       │  │ │   │  │ - 7-year retention         ││
│  │ │ - Analytics Logs     │  │ │   │  │ - Compliance Archives      ││
│  │ └──────────────────────┘  │ │   │  └────────────────────────────┘│
│  │                            │ │   │                                 │
│  │ ┌──────────────────────┐  │ │   └─────────────────────────────────┘
│  │ │ Redis Cluster        │  │ │
│  │ │ - Session Cache      │  │ │
│  │ │ - Real-time Queues   │  │ │   ┌─────────────────────────────────┐
│  │ └──────────────────────┘  │ │   │  COMPLIANCE & MONITORING        │
│  └────────────────────────────┘ │   │  (India-based)                  │
│                                  │   │                                 │
│  ┌────────────────────────────┐ │   │  ┌────────────────────────────┐│
│  │ Security Layer             │ │   │  │ Audit Logging              ││
│  │ - AWS WAF                  │ │   │  │ - CloudTrail               ││
│  │ - DDoS Protection          │ │   │  │ - Data Access Logs         ││
│  │ - Encryption (KMS)         │ │   │  │ - Compliance Reports       ││
│  │ - IAM Policies             │ │   │  └────────────────────────────┘│
│  └────────────────────────────┘ │   │                                 │
│                                  │   │  ┌────────────────────────────┐│
│  ┌────────────────────────────┐ │   │  │ Monitoring Dashboard       ││
│  │ Object Storage (S3)        │ │   │  │ - Grafana (Compliance)     ││
│  │ - Document Vault           │ │   │  │ - Real-time Alerts         ││
│  │ - KYC Documents            │ │   │  │ - SLA Monitoring           ││
│  │ - Encrypted at Rest        │ │   │  └────────────────────────────┘│
│  └────────────────────────────┘ │   └─────────────────────────────────┘
└─────────────────────────────────┘

                    ▲
                    │ (Anonymized Analytics Only)
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  INTERNATIONAL PROCESSING (Optional)                                     │
│  - Business Intelligence (Anonymized Data)                               │
│  - Machine Learning Training (Non-PII)                                   │
│  - Development/Staging Environments (Masked Data)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Specifications

### 2.1 Primary Data Center (AWS Mumbai ap-south-1)

#### **Compute Infrastructure**

| Component | Specification | Quantity | Purpose |
|-----------|---------------|----------|---------|
| **EKS Cluster** | m6i.2xlarge (8 vCPU, 32GB RAM) | 6-12 nodes (auto-scale) | Application workloads |
| **API Gateway** | t3.large | 3 instances (HA) | Request routing, rate limiting |
| **Bastion Hosts** | t3.medium | 2 instances | Secure SSH access |
| **NAT Gateways** | AWS Managed | 3 (Multi-AZ) | Outbound connectivity |

#### **Database Infrastructure**

| Database | Type | Specification | Storage | Backup |
|----------|------|---------------|---------|--------|
| **PostgreSQL** | RDS Multi-AZ | db.r6i.2xlarge (8 vCPU, 64GB) | 2TB SSD (io2) | Automated daily + WAL |
| **MongoDB** | Atlas M40 | Sharded cluster (3 shards) | 1.5TB per shard | Continuous + Point-in-time |
| **Redis** | ElastiCache | cache.r6g.xlarge (4 vCPU, 32GB) | 256GB | Daily snapshots |
| **TimescaleDB** | Self-managed | r6i.xlarge | 500GB | Continuous replication |

#### **Storage Infrastructure**

| Storage Type | Service | Configuration | Encryption | Replication |
|--------------|---------|---------------|------------|-------------|
| **Object Storage** | S3 Standard | 10TB initial | AES-256 + KMS | Cross-region disabled |
| **Block Storage** | EBS io2 | 5TB provisioned IOPS | Encrypted at rest | Multi-AZ snapshots |
| **Archive Storage** | S3 Glacier Deep Archive | Unlimited | AES-256 | India-only vaults |

#### **Network Configuration**

```
VPC: 10.0.0.0/16 (Mumbai Region)

├── Public Subnets (DMZ)
│   ├── 10.0.1.0/24 (AZ-1a) - Load Balancers, NAT
│   ├── 10.0.2.0/24 (AZ-1b) - Load Balancers, NAT
│   └── 10.0.3.0/24 (AZ-1c) - Load Balancers, NAT
│
├── Private Subnets (Application Tier)
│   ├── 10.0.10.0/24 (AZ-1a) - EKS Nodes
│   ├── 10.0.11.0/24 (AZ-1b) - EKS Nodes
│   └── 10.0.12.0/24 (AZ-1c) - EKS Nodes
│
└── Database Subnets (Data Tier)
    ├── 10.0.20.0/24 (AZ-1a) - RDS Primary
    ├── 10.0.21.0/24 (AZ-1b) - RDS Standby
    └── 10.0.22.0/24 (AZ-1c) - Backup Services

Security Groups:
├── ALB-SG (Ingress: 443, 80 from Internet)
├── App-SG (Ingress: 8080 from ALB-SG)
├── DB-SG (Ingress: 5432, 27017 from App-SG only)
└── Redis-SG (Ingress: 6379 from App-SG only)
```

---

### 2.2 Disaster Recovery Data Center (Azure India Central)

#### **DR Strategy: Active-Passive with Hot Standby**

| Component | Configuration | Sync Frequency | Failover Time |
|-----------|---------------|----------------|---------------|
| **Application** | Full deployment (passive) | Real-time via CI/CD | <60 seconds |
| **PostgreSQL** | Read replica (Azure Database) | 5-second lag | <15 minutes |
| **MongoDB** | Secondary replica set | Real-time oplog | <30 seconds |
| **Redis** | Replica instance | 1-second lag | <10 seconds |
| **Object Storage** | Azure Blob (LRS) | 15-minute batch sync | <5 minutes |

#### **Compute Infrastructure (DR Site)**

| Component | Specification | State | Purpose |
|-----------|---------------|-------|---------|
| **AKS Cluster** | Standard_D8s_v3 (8 vCPU, 32GB) | Running (passive) | DR application pods |
| **Load Balancer** | Azure Standard LB | Active (DNS standby) | Failover endpoint |
| **VM Scale Sets** | Standard_D4s_v3 | Stopped (rapid start) | Burst capacity |

---

## 3. Data Residency Compliance Architecture

### 3.1 Data Classification Framework

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATA CLASSIFICATION MATRIX                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  CLASS 1: CRITICAL FINANCIAL DATA (INDIA-ONLY)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Payment transactions (UPI, IMPS, NEFT, RTGS)             │ │
│  │ • Card credentials (encrypted tokens)                      │ │
│  │ • Bank account numbers (masked)                            │ │
│  │ • Wallet balances and transaction history                  │ │
│  │ • Credit/debit transaction logs                            │ │
│  │                                                             │ │
│  │ Storage: AWS Mumbai + Azure Pune (replica only)            │ │
│  │ Retention: 7 years (RBI mandate)                           │ │
│  │ Encryption: AES-256-GCM + HSM key management               │ │
│  │ Access: 2FA + IP whitelist + audit logging                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  CLASS 2: CUSTOMER PERSONAL DATA (INDIA PRIMARY)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • KYC documents (Aadhaar, PAN, Passport)                   │ │
│  │ • Customer profiles (name, address, phone, email)          │ │
│  │ • Biometric data (facial recognition, fingerprints)        │ │
│  │ • Income/employment information                            │ │
│  │ • Tax identification numbers                               │ │
│  │                                                             │ │
│  │ Storage: India primary + India DR backup                   │ │
│  │ Retention: Until consent withdrawal + 5 years              │ │
│  │ Encryption: Field-level encryption + tokenization          │ │
│  │ Access: Role-based + data masking for non-compliance roles │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  CLASS 3: OPERATIONAL DATA (INDIA + CONDITIONAL EXPORT)          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • User session logs (anonymized)                           │ │
│  │ • Application performance metrics                          │ │
│  │ • Anonymized analytics data                                │ │
│  │ • Aggregated business intelligence                         │ │
│  │ • Marketing campaign data (consent-based)                  │ │
│  │                                                             │ │
│  │ Storage: India primary, anonymized copies can be abroad    │ │
│  │ Retention: 3 years                                         │ │
│  │ Encryption: TLS in transit, AES-128 at rest                │ │
│  │ Access: Standard IAM policies                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  CLASS 4: PUBLIC/NON-SENSITIVE DATA (UNRESTRICTED)               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Marketing content                                        │ │
│  │ • Public product information                               │ │
│  │ • Open-source code repositories                            │ │
│  │ • Public API documentation                                 │ │
│  │                                                             │ │
│  │ Storage: CDN (CloudFront, Cloudflare)                      │ │
│  │ Retention: No restriction                                  │ │
│  │ Encryption: Optional                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  USER REQUEST FLOW (RBI COMPLIANCE)                             │
└─────────────────────────────────────────────────────────────────┘

1. User Authentication Request (India/Global)
   │
   ├──► CloudFront (Global CDN) ──► Route53 DNS
   │                                    │
   │                                    ▼
   │                    ┌───────────────────────────┐
   │                    │   Geographic Routing      │
   │                    │   - Indian IP → Mumbai    │
   │                    │   - Others → Nearest Edge │
   │                    └───────────────────────────┘
   │                                    │
   ▼                                    ▼
   AWS WAF (DDoS Protection)     India-Only Gateway
   │                                    │
   ├──► Rate Limiting (10k req/min)    │
   │                                    │
   ▼                                    ▼
┌──────────────────────────────────────────────────────────────┐
│  APPLICATION LOAD BALANCER (Mumbai)                          │
│  - SSL Termination (ACM Certificate)                         │
│  - Health Checks (HTTP 200 on /health)                       │
│  - Session Affinity (Cookie-based)                           │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│  KUBERNETES INGRESS CONTROLLER (NGINX)                       │
│  - Path-based routing                                        │
│  - Authentication middleware                                 │
│  - Request logging (anonymized IPs)                          │
└──────────────────────────────────────────────────────────────┘
   │
   ├──► /api/auth/** ──► Authentication Service
   ├──► /api/payments/** ──► Payment Service (Class 1 Data)
   ├──► /api/kyc/** ──► KYC Service (Class 2 Data)
   └──► /api/analytics/** ──► Analytics Service (Class 3 Data)
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│  MICROSERVICES LAYER                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Payment Service (Pods: 10-50 replicas)               │ │
│  │  - Validates transaction                              │ │
│  │  - Calls Payment Gateway (Razorpay/PhonePe)           │ │
│  │  - Writes to PostgreSQL (Class 1 table)               │ │
│  │  - Publishes event to Kafka (India broker)            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│  DATA PERSISTENCE LAYER (INDIA ONLY)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL (Primary - Mumbai AZ-1a)                   │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  INSERT INTO transactions                        │ │ │
│  │  │  (user_id, amount, currency, timestamp, status) │ │ │
│  │  │  VALUES (?, ?, 'INR', NOW(), 'PENDING');        │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │          │                                             │ │
│  │          ▼ (Synchronous Replication)                  │ │
│  │  PostgreSQL (Standby - Mumbai AZ-1b) ◄──┐             │ │
│  │          │                               │             │ │
│  │          ▼ (Async Replication)           │             │ │
│  │  PostgreSQL (DR - Pune Azure)            │             │ │
│  └────────────────────────────────────────┬─┴─────────────┘ │
│                                            │                 │
│  Audit Log: ✅ Transaction written        │                 │
│  Location: Mumbai, India                  │                 │
│  Timestamp: 2025-11-06T14:23:45.123Z      │                 │
│  Compliance: RBI + DPDP Act               │                 │
│                                            ▼                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  S3 Bucket (Mumbai Region)                             │ │
│  │  - Encrypted audit logs (7-year retention)             │ │
│  │  - Lifecycle policy: Glacier after 90 days             │ │
│  │  - Object Lock: WORM compliance mode                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                │
                ▼ (Real-time Event Stream)
┌──────────────────────────────────────────────────────────────┐
│  KAFKA CLUSTER (India-based brokers)                         │
│  - Topic: payment-events (retention: 30 days)                │
│  - Consumers: Risk engine, fraud detection, analytics        │
└──────────────────────────────────────────────────────────────┘
                │
                ▼ (Anonymized aggregates only)
┌──────────────────────────────────────────────────────────────┐
│  OPTIONAL: International Analytics (Non-PII)                 │
│  - Aggregated revenue metrics                                │
│  - User behavior patterns (anonymized)                       │
│  - ML model training (synthetic data)                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Security Architecture

### 4.1 Defense-in-Depth Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: PERIMETER SECURITY                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ AWS Shield Advanced (DDoS Protection)                     │ │
│  │ - 10 Tbps mitigation capacity                             │ │
│  │ - 24/7 DDoS Response Team (DRT)                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ AWS WAF (Web Application Firewall)                        │ │
│  │ - OWASP Top 10 protection                                 │ │
│  │ - SQL injection prevention                                │ │
│  │ - XSS filtering                                           │ │
│  │ - Rate limiting (10,000 req/min per IP)                   │ │
│  │ - Geo-blocking (configurable)                             │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: NETWORK SECURITY                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ VPC Isolation (Mumbai: 10.0.0.0/16)                       │ │
│  │ - Public subnets (DMZ only)                               │ │
│  │ - Private subnets (app tier - no internet access)         │ │
│  │ - Database subnets (isolated, no NAT gateway)             │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Security Groups (Stateful Firewall)                       │ │
│  │ - Principle of least privilege                            │ │
│  │ - Deny all inbound by default                             │ │
│  │ - Allow only required ports (443, 80, 5432, 27017)        │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Network ACLs (Stateless Firewall)                         │ │
│  │ - Subnet-level rules                                      │ │
│  │ - Block known malicious IPs                               │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: APPLICATION SECURITY                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ API Gateway Authentication                                │ │
│  │ - OAuth 2.0 / OpenID Connect                              │ │
│  │ - JWT token validation (RS256)                            │ │
│  │ - API key management                                      │ │
│  │ - Rate limiting per API key                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Service Mesh Security (Istio)                             │ │
│  │ - mTLS between microservices                              │ │
│  │ - Certificate rotation (30-day validity)                  │ │
│  │ - Request authorization policies                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Container Security                                        │ │
│  │ - Image scanning (Trivy, AWS ECR scanning)                │ │
│  │ - No root containers (non-privileged)                     │ │
│  │ - Read-only root filesystem                               │ │
│  │ - Resource limits (CPU, memory)                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: DATA SECURITY                                         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Encryption at Rest                                        │ │
│  │ - RDS: AES-256 encryption (AWS KMS)                       │ │
│  │ - MongoDB: Encrypted storage engine                       │ │
│  │ - S3: Server-side encryption (SSE-KMS)                    │ │
│  │ - EBS: Volume-level encryption                            │ │
│  │ - Key rotation: Every 90 days                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Encryption in Transit                                     │ │
│  │ - TLS 1.3 (minimum TLS 1.2)                               │ │
│  │ - Certificate pinning (mobile apps)                       │ │
│  │ - Perfect Forward Secrecy (PFS) enabled                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Data Masking & Tokenization                               │ │
│  │ - PII masking in non-production environments              │ │
│  │ - Credit card tokenization (PCI DSS compliant)            │ │
│  │ - Aadhaar masking (last 4 digits only)                    │ │
│  │ - PAN tokenization                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LAYER 5: IDENTITY & ACCESS MANAGEMENT                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ IAM Policies (Least Privilege)                            │ │
│  │ - Role-based access control (RBAC)                        │ │
│  │ - Service accounts for apps (no long-lived credentials)   │ │
│  │ - MFA required for human users                            │ │
│  │ - Session duration: 1 hour (max 8 hours)                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Database Access Control                                   │ │
│  │ - Separate DB users per microservice                      │ │
│  │ - Row-level security (PostgreSQL RLS)                     │ │
│  │ - Audit logging for all queries                           │ │
│  │ - IP whitelisting (VPC only)                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LAYER 6: MONITORING & INCIDENT RESPONSE                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Security Information & Event Management (SIEM)            │ │
│  │ - AWS Security Hub (centralized findings)                 │ │
│  │ - GuardDuty (threat detection)                            │ │
│  │ - Inspector (vulnerability scanning)                      │ │
│  │ - CloudWatch Logs Insights (log analysis)                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Audit Trail (Compliance Logging)                          │ │
│  │ - CloudTrail (all API calls)                              │ │
│  │ - VPC Flow Logs (network traffic)                         │ │
│  │ - Application logs (structured JSON)                      │ │
│  │ - Database audit logs (all DML/DDL)                       │ │
│  │ - Retention: 7 years (RBI requirement)                    │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 KMS Key Management Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  AWS KEY MANAGEMENT SERVICE (KMS) - Mumbai Region            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Master Keys (CMKs - Customer Managed Keys)            │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  1. RDS-Master-Key                               │ │ │
│  │  │     - Purpose: PostgreSQL database encryption    │ │ │
│  │  │     - Rotation: Automatic (365 days)             │ │ │
│  │  │     - Access: DB admin role only                 │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  2. S3-Document-Key                              │ │ │
│  │  │     - Purpose: KYC documents, audit logs         │ │ │
│  │  │     - Rotation: Automatic (90 days)              │ │ │
│  │  │     - Access: Compliance team + automation       │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  3. Application-Data-Key                         │ │ │
│  │  │     - Purpose: Application-level encryption      │ │ │
│  │  │     - Rotation: Automatic (90 days)              │ │ │
│  │  │     - Access: App service roles                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  4. Secrets-Manager-Key                          │ │ │
│  │  │     - Purpose: Database passwords, API keys      │ │ │
│  │  │     - Rotation: Automatic (30 days)              │ │ │
│  │  │     - Access: SecretsManager service             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Key Policy Example (RDS-Master-Key):                         │
│  {                                                            │
│    "Version": "2012-10-17",                                   │
│    "Statement": [                                             │
│      {                                                        │
│        "Sid": "Enable IAM policies",                          │
│        "Effect": "Allow",                                     │
│        "Principal": {                                         │
│          "AWS": "arn:aws:iam::ACCOUNT:root"                   │
│        },                                                     │
│        "Action": "kms:*",                                     │
│        "Resource": "*"                                        │
│      },                                                       │
│      {                                                        │
│        "Sid": "Allow RDS to use key",                         │
│        "Effect": "Allow",                                     │
│        "Principal": {                                         │
│          "Service": "rds.amazonaws.com"                       │
│        },                                                     │
│        "Action": [                                            │
│          "kms:Decrypt",                                       │
│          "kms:GenerateDataKey"                                │
│        ],                                                     │
│        "Resource": "*",                                       │
│        "Condition": {                                         │
│          "StringEquals": {                                    │
│            "kms:ViaService": "rds.ap-south-1.amazonaws.com"   │
│          }                                                    │
│        }                                                      │
│      }                                                        │
│    ]                                                          │
│  }                                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Compliance Monitoring Architecture

### 5.1 Real-Time Compliance Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│  COMPLIANCE MONITORING STACK                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Data Collection Layer                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ CloudWatch Logs ──► Lambda (processor) ──► Kinesis Stream  │ │
│  │      ▲                                          │           │ │
│  │      │                                          ▼           │ │
│  │      │                               ┌──────────────────┐  │ │
│  │  Application Logs                    │  OpenSearch      │  │ │
│  │  Database Logs                       │  (Compliance     │  │ │
│  │  Audit Trails                        │   Analytics)     │  │ │
│  │  Network Logs                        └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                          │                       │
│                                          ▼                       │
│  Analysis & Alerting Layer                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Compliance Rules Engine (Lambda)                          │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Rule 1: Data Residency Check                        │ │ │
│  │  │  - Query: SELECT region FROM data_operations         │ │ │
│  │  │  - Alert if region != 'ap-south-1' OR 'centralindia' │ │ │
│  │  │  - Severity: CRITICAL                                │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Rule 2: Encryption Validation                       │ │ │
│  │  │  - Check: All S3 PutObject events have SSE enabled   │ │ │
│  │  │  - Alert if encryption=null                          │ │ │
│  │  │  - Severity: HIGH                                    │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Rule 3: Access Control Audit                        │ │ │
│  │  │  - Monitor: IAM policy changes                       │ │ │
│  │  │  - Alert if public access granted to S3/DB          │ │ │
│  │  │  - Severity: CRITICAL                                │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Rule 4: Audit Log Completeness                      │ │ │
│  │  │  - Check: CloudTrail events every 5 minutes          │ │ │
│  │  │  - Alert if gap > 10 minutes                         │ │ │
│  │  │  - Severity: MEDIUM                                  │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                          │                       │
│                                          ▼                       │
│  Visualization Layer                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Grafana Dashboards (compliance.taurus-ai.com)            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  RBI Compliance Dashboard                            │ │ │
│  │  │  ┌────────────────┐  ┌────────────────┐             │ │ │
│  │  │  │ Data Residency │  │ Encryption     │             │ │ │
│  │  │  │ Status: ✅ 100%│  │ Status: ✅ 100%│             │ │ │
│  │  │  └────────────────┘  └────────────────┘             │ │ │
│  │  │  ┌────────────────┐  ┌────────────────┐             │ │ │
│  │  │  │ Audit Logs     │  │ Backup Status  │             │ │ │
│  │  │  │ 7yr Retention  │  │ RPO: 5min      │             │ │ │
│  │  │  │ ✅ Compliant   │  │ ✅ Compliant   │             │ │ │
│  │  │  └────────────────┘  └────────────────┘             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  DPDP Act Compliance Dashboard                       │ │ │
│  │  │  ┌────────────────┐  ┌────────────────┐             │ │ │
│  │  │  │ Consent Mgmt   │  │ Data Deletion  │             │ │ │
│  │  │  │ Active: 12.5K  │  │ Requests: 145  │             │ │ │
│  │  │  │ Pending: 23    │  │ Completed: 142 │             │ │ │
│  │  │  └────────────────┘  └────────────────┘             │ │ │
│  │  │  ┌────────────────┐  ┌────────────────┐             │ │ │
│  │  │  │ Data Breaches  │  │ Third-party    │             │ │ │
│  │  │  │ Count: 0       │  │ Processors: 8  │             │ │ │
│  │  │  │ ✅ No incidents│  │ ✅ Audited     │             │ │ │
│  │  │  └────────────────┘  └────────────────┘             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                          │                       │
│                                          ▼                       │
│  Notification Layer                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SNS Topics ──► Email, Slack, PagerDuty                    │ │
│  │  - CRITICAL: Immediate alert (5-minute SLA)                │ │
│  │  - HIGH: 15-minute SLA                                     │ │
│  │  - MEDIUM: Daily digest                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Cost Analysis

### 6.1 Monthly Infrastructure Costs (Estimated)

#### **AWS Mumbai (Primary Data Center)**

| Component | Specification | Monthly Cost (INR) | Monthly Cost (USD) |
|-----------|---------------|--------------------|--------------------|
| **Compute (EKS)** | 8 x m6i.2xlarge (avg) | ₹2,80,000 | $3,360 |
| **Database (RDS)** | db.r6i.2xlarge Multi-AZ | ₹1,45,000 | $1,740 |
| **MongoDB Atlas** | M40 Sharded (3 shards) | ₹95,000 | $1,140 |
| **Redis (ElastiCache)** | cache.r6g.xlarge | ₹42,000 | $504 |
| **Storage (S3 + EBS)** | 15TB total | ₹68,000 | $816 |
| **Network (Data Transfer)** | 20TB outbound | ₹1,12,000 | $1,344 |
| **Load Balancers** | 2 x ALB + NLB | ₹28,000 | $336 |
| **WAF + Shield** | Advanced tier | ₹2,50,000 | $3,000 |
| **CloudWatch + Logs** | 500GB logs/month | ₹35,000 | $420 |
| **KMS** | 4 CMKs + operations | ₹8,000 | $96 |
| **Backup (AWS Backup)** | 10TB incremental | ₹22,000 | $264 |
| **Support** | Business Support (10% of usage) | ₹90,000 | $1,080 |
| **Subtotal** | | **₹11,75,000** | **$14,100** |

#### **Azure India (DR Data Center)**

| Component | Specification | Monthly Cost (INR) | Monthly Cost (USD) |
|-----------|---------------|--------------------|--------------------|
| **AKS Cluster** | 4 x Standard_D8s_v3 (passive) | ₹85,000 | $1,020 |
| **Azure Database (PostgreSQL)** | Read replica | ₹65,000 | $780 |
| **Blob Storage** | 8TB LRS | ₹28,000 | $336 |
| **Load Balancer** | Standard tier | ₹12,000 | $144 |
| **Monitoring** | Azure Monitor | ₹18,000 | $216 |
| **Subtotal** | | **₹2,08,000** | **$2,496** |

#### **Additional Services**

| Component | Description | Monthly Cost (INR) | Monthly Cost (USD) |
|-----------|-------------|--------------------|--------------------|
| **Compliance Tools** | OpenSearch, Grafana Cloud | ₹45,000 | $540 |
| **SSL Certificates** | 10 domains (wildcard) | ₹8,000 | $96 |
| **External Monitoring** | Pingdom, Datadog agents | ₹22,000 | $264 |
| **Subtotal** | | **₹75,000** | **$900** |

### **Total Monthly Operational Cost**: **₹14,58,000** (~$17,500)

### 6.2 One-Time Implementation Costs

| Activity | Effort (Hours) | Cost (INR) | Cost (USD) |
|----------|----------------|------------|------------|
| **Architecture Design** | 80 hours @ ₹5,000/hr | ₹4,00,000 | $4,800 |
| **Infrastructure Setup** | 160 hours | ₹8,00,000 | $9,600 |
| **Data Migration** | 120 hours | ₹6,00,000 | $7,200 |
| **Security Hardening** | 80 hours | ₹4,00,000 | $4,800 |
| **Compliance Documentation** | 60 hours | ₹3,00,000 | $3,600 |
| **Testing & Validation** | 80 hours | ₹4,00,000 | $4,800 |
| **Training** | 40 hours | ₹2,00,000 | $2,400 |
| **Contingency (15%)** | - | ₹4,65,000 | $5,580 |
| **Total** | **620 hours** | **₹36,65,000** | **$43,980** |

### 6.3 Cost Optimization Strategies

```
┌──────────────────────────────────────────────────────────────┐
│  COST OPTIMIZATION ROADMAP                                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Short-term (0-3 months) - Save ₹2.5L/month:                │
│  ✅ Reserved Instances (1-year) - 30% discount on compute    │
│  ✅ S3 Intelligent Tiering - 40% savings on storage          │
│  ✅ RDS Reserved Instances - 35% discount                    │
│  ✅ Rightsize over-provisioned resources                     │
│                                                               │
│  Medium-term (3-6 months) - Save ₹4L/month:                 │
│  ✅ Spot instances for non-critical workloads (70% discount) │
│  ✅ S3 Glacier for old audit logs (90% cheaper)              │
│  ✅ Auto-scaling optimization (reduce idle capacity)         │
│  ✅ Data transfer optimization (CloudFront caching)          │
│                                                               │
│  Long-term (6+ months) - Save ₹5.5L/month:                  │
│  ✅ Savings Plans (3-year commitment) - 50% discount         │
│  ✅ Migrate to Graviton instances (20% better price/perf)    │
│  ✅ Database optimization (read replicas, caching)           │
│  ✅ Archive cold data (tape backup alternative)              │
│                                                               │
│  TOTAL POTENTIAL SAVINGS: ₹12 lakhs/month (68% reduction)   │
│  Optimized Monthly Cost: ₹4.6 lakhs/month (~$5,520)         │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Disaster Recovery & Business Continuity

### 7.1 DR Objectives

| Metric | Target | RBI Requirement | TAURUS AI Target |
|--------|--------|-----------------|------------------|
| **RPO (Recovery Point Objective)** | <1 hour | <4 hours | **<5 minutes** |
| **RTO (Recovery Time Objective)** | <4 hours | <24 hours | **<15 minutes** |
| **Data Durability** | 99.999999999% | 99.99% | **11 nines (S3)** |
| **Availability SLA** | 99.95% | 99.5% | **99.99%** |

### 7.2 Failover Procedures

```
┌──────────────────────────────────────────────────────────────┐
│  DISASTER RECOVERY PLAYBOOK                                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  SCENARIO 1: AWS Mumbai Region Failure                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Trigger: Health check fails for 3 consecutive minutes │ │
│  │                                                         │ │
│  │  Automated Actions (0-5 minutes):                      │ │
│  │  1. Route53 health check detects failure               │ │
│  │  2. DNS failover to Azure India (TTL: 60 seconds)      │ │
│  │  3. Azure AKS pods scale from 0 to 20 replicas         │ │
│  │  4. PostgreSQL read replica promoted to primary        │ │
│  │  5. MongoDB secondary becomes primary (auto-election)  │ │
│  │                                                         │ │
│  │  Manual Actions (5-15 minutes):                        │ │
│  │  6. Verify database integrity (checksums)              │ │
│  │  7. Confirm application health (/health endpoint)      │ │
│  │  8. Enable write traffic to Azure databases            │ │
│  │  9. Notify stakeholders (Slack, email)                 │ │
│  │  10. Begin post-mortem documentation                   │ │
│  │                                                         │ │
│  │  Expected Downtime: 5-15 minutes                       │ │
│  │  Data Loss: <5 minutes of transactions (RPO met)       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  SCENARIO 2: Database Corruption                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Trigger: Data integrity check fails                   │ │
│  │                                                         │ │
│  │  Manual Actions (0-30 minutes):                        │ │
│  │  1. Stop all write traffic (circuit breaker)           │ │
│  │  2. Identify last good backup (automated snapshots)    │ │
│  │  3. Restore from snapshot to new RDS instance          │ │
│  │  4. Validate data integrity (checksums, row counts)    │ │
│  │  5. Replay transaction logs from CloudWatch            │ │
│  │  6. Switch application to restored database            │ │
│  │                                                         │ │
│  │  Expected Downtime: 20-30 minutes                      │ │
│  │  Data Loss: Based on backup frequency (15min backups)  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  SCENARIO 3: Security Breach / Ransomware                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Trigger: Intrusion detected by GuardDuty              │ │
│  │                                                         │ │
│  │  Immediate Actions (0-15 minutes):                     │ │
│  │  1. Isolate affected resources (Security Group lockdown)│ │
│  │  2. Revoke all IAM session tokens                      │ │
│  │  3. Enable S3 Object Lock (WORM mode)                  │ │
│  │  4. Snapshot all databases (forensic evidence)         │ │
│  │  5. Notify CERT-In (within 6 hours - legal req)       │ │
│  │                                                         │ │
│  │  Recovery Actions (15-60 minutes):                     │ │
│  │  6. Deploy clean infrastructure from IaC               │ │
│  │  7. Restore data from immutable backups                │ │
│  │  8. Rotate all secrets (passwords, API keys)           │ │
│  │  9. Conduct security audit                             │ │
│  │  10. File incident report with RBI                     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Timeline

### 8.1 Phased Rollout (12-Week Plan)

```
┌────────────────────────────────────────────────────────────────┐
│  WEEK 1-2: FOUNDATION PHASE                                    │
├────────────────────────────────────────────────────────────────┤
│  ✅ Infrastructure provisioning (AWS Mumbai VPC, subnets)      │
│  ✅ Security baseline (IAM roles, KMS keys, Security Groups)   │
│  ✅ Network configuration (VPN, Direct Connect planning)       │
│  ✅ Monitoring setup (CloudWatch, Grafana)                     │
│  Deliverables:                                                 │
│  - AWS account configured with Organizations                   │
│  - Production VPC ready (10.0.0.0/16)                          │
│  - Security baseline documented                                │
│  Risk: Low | Cost: ₹2L | Team: 2 engineers                    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  WEEK 3-4: DATA LAYER PHASE                                    │
├────────────────────────────────────────────────────────────────┤
│  ✅ RDS PostgreSQL cluster setup (Multi-AZ)                    │
│  ✅ MongoDB Atlas deployment (M40 sharded cluster)             │
│  ✅ Redis ElastiCache configuration                            │
│  ✅ S3 buckets with encryption and lifecycle policies          │
│  ✅ Database migration testing (staging environment)           │
│  Deliverables:                                                 │
│  - All databases operational in Mumbai                         │
│  - Backup strategy validated (RPO <5min)                       │
│  - Database access controls configured                         │
│  Risk: Medium | Cost: ₹5L | Team: 3 engineers                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  WEEK 5-6: APPLICATION LAYER PHASE                             │
├────────────────────────────────────────────────────────────────┤
│  ✅ EKS cluster deployment (Kubernetes 1.28)                   │
│  ✅ Service mesh setup (Istio for mTLS)                        │
│  ✅ CI/CD pipeline configuration (GitHub Actions → ECR → EKS)  │
│  ✅ Application deployment (AssetGrid, ORIONGRID)              │
│  ✅ API Gateway integration (rate limiting, auth)              │
│  Deliverables:                                                 │
│  - Applications running in India (Mumbai)                      │
│  - Auto-scaling configured (2-20 pods per service)             │
│  - Health checks and liveness probes active                    │
│  Risk: Medium | Cost: ₹4L | Team: 4 engineers                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  WEEK 7-8: DATA MIGRATION PHASE                                │
├────────────────────────────────────────────────────────────────┤
│  ✅ Data classification audit (Class 1-4 categorization)       │
│  ✅ Production data export (encrypted backups)                 │
│  ✅ Migration to India data centers (AWS DMS for databases)    │
│  ✅ Data validation (checksums, row counts)                    │
│  ✅ Parallel run (dual-write mode for 1 week)                  │
│  Deliverables:                                                 │
│  - 100% financial data in India (verified)                     │
│  - Zero data loss confirmed                                    │
│  - Old infrastructure still active (rollback plan)             │
│  Risk: HIGH | Cost: ₹8L | Team: 5 engineers + DBA             │
│  CRITICAL: Requires maintenance window (2AM-6AM IST)           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  WEEK 9-10: DR & COMPLIANCE PHASE                              │
├────────────────────────────────────────────────────────────────┤
│  ✅ Azure DR site setup (Pune data center)                     │
│  ✅ Cross-region replication configuration                     │
│  ✅ Disaster recovery testing (failover drill)                 │
│  ✅ Compliance monitoring automation                           │
│  ✅ Audit logging validation (7-year retention)                │
│  Deliverables:                                                 │
│  - DR site operational (RTO <15min validated)                  │
│  - Automated failover tested successfully                      │
│  - Compliance dashboards live                                  │
│  Risk: Medium | Cost: ₹3.5L | Team: 3 engineers               │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  WEEK 11: SECURITY HARDENING PHASE                             │
├────────────────────────────────────────────────────────────────┤
│  ✅ Penetration testing (third-party VAPT)                     │
│  ✅ WAF rule optimization                                      │
│  ✅ Secrets rotation (all passwords, API keys)                 │
│  ✅ Security audit (AWS Security Hub review)                   │
│  ✅ Incident response playbook testing                         │
│  Deliverables:                                                 │
│  - VAPT report with all HIGH/CRITICAL issues resolved          │
│  - SOC 2 Type II readiness assessment                          │
│  - Security runbooks documented                                │
│  Risk: Low | Cost: ₹6L (incl. external audit) | Team: 2       │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  WEEK 12: GO-LIVE & OPTIMIZATION                               │
├────────────────────────────────────────────────────────────────┤
│  ✅ Final cutover (DNS switch to India endpoints)              │
│  ✅ 24/7 monitoring activation (PagerDuty on-call)             │
│  ✅ Decommission old infrastructure (cost savings begin)       │
│  ✅ RBI compliance certification (documentation submission)    │
│  ✅ Team training (runbooks, escalation procedures)            │
│  Deliverables:                                                 │
│  - 100% traffic routed to India (compliance achieved)          │
│  - Old infrastructure decommissioned                           │
│  - Compliance certificate obtained (or in-progress)            │
│  Risk: Low | Cost: ₹2.5L | Team: Full team                    │
│  SUCCESS CRITERIA: 99.99% uptime in first 30 days              │
└────────────────────────────────────────────────────────────────┘

TOTAL TIMELINE: 12 weeks (84 days)
TOTAL COST: ₹33 lakhs (implementation) + ₹14.58L/month (operational)
TEAM SIZE: 5-7 engineers (rotating based on phase)
```

---

## 9. Success Metrics & KPIs

### 9.1 Compliance KPIs

| Metric | Target | Measurement Method | Reporting Frequency |
|--------|--------|--------------------|---------------------|
| **Data Residency Compliance** | 100% | Automated region checks | Real-time |
| **Encryption Coverage** | 100% | KMS key usage monitoring | Daily |
| **Audit Log Completeness** | 100% | CloudTrail gap analysis | Hourly |
| **Backup Success Rate** | 99.9% | AWS Backup reports | Daily |
| **DR Test Success** | 100% | Quarterly failover drills | Quarterly |
| **Security Patch Compliance** | <7 days | Vulnerability scanning | Weekly |
| **Incident Response Time** | <15 min | PagerDuty metrics | Per incident |

### 9.2 Business KPIs

| Metric | Target | Business Impact |
|--------|--------|-----------------|
| **System Uptime** | 99.99% | ₹2.8L revenue/hour (based on $17M portfolio) |
| **Page Load Time** | <2 seconds | 7% conversion rate impact per 100ms |
| **API Response Time (p95)** | <200ms | Customer satisfaction (NPS +12) |
| **Cost per Transaction** | <₹0.50 | 40% margin improvement target |
| **Scalability** | 10x current load | Support 100K concurrent users |

---

## 10. Appendices

### 10.1 Regulatory References

- **RBI Master Direction** - DPSS.CO.PD No.1810/02.27.019/2017-18 (Data Localization)
- **DPDP Act 2023** - Digital Personal Data Protection Act
- **IT Act 2000** - Section 43A (Data Protection)
- **RBI Cyber Security Framework** - 2016 (updated 2023)
- **NPCI Guidelines** - UPI, IMPS data storage requirements

### 10.2 Architecture Decision Records (ADRs)

1. **ADR-001**: AWS Mumbai chosen over GCP Inda due to superior RBI compliance tooling
2. **ADR-002**: PostgreSQL selected over MySQL for JSON support and RLS capabilities
3. **ADR-003**: Kubernetes (EKS) chosen over ECS for portability and DR flexibility
4. **ADR-004**: Active-Passive DR strategy (not Active-Active) due to cost optimization
5. **ADR-005**: Azure India selected for DR over second AWS region for vendor diversity

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-06 | TAURUS AI Infrastructure Team | Initial RBI-compliant architecture design |

---

**Document Classification**: Internal - Strategic
**Review Cycle**: Quarterly
**Next Review**: 2026-02-06
**Approvals Required**: CTO, CISO, Compliance Officer
