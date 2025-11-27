import { motion } from "framer-motion";
import { 
  Activity, 
  Shield, 
  Cpu, 
  Database, 
  Terminal, 
  Globe, 
  Zap,
  Lock,
  Server,
  Wifi
} from "lucide-react";
import { useEffect, useState } from "react";
import AccountBalance from "@/components/account-balance";
import Header from "@/components/Header";

// Simulated Agent Data based on taurus_integration.py
const AGENTS = [
  {
    id: "revenue_optimizer",
    name: "REVENUE OPTIMIZER",
    status: "ACTIVE",
    uptime: "99.8%",
    load: "45%",
    activity: "Analyzing yield spreads",
    color: "text-accent"
  },
  {
    id: "crypto_trading",
    name: "ASSETGRID CRYPTO",
    status: "TRADING",
    uptime: "99.9%",
    load: "82%",
    activity: "Rebalancing portfolio",
    color: "text-warning"
  },
  {
    id: "compliance_monitor",
    name: "COMPLIANCE SENTINEL",
    status: "SCANNING",
    uptime: "100%",
    load: "23%",
    activity: "Checking KYC/AML flags",
    color: "text-green-500"
  },
  {
    id: "hedera_bridge",
    name: "HEDERA HTS BRIDGE",
    status: "MINTING",
    uptime: "99.9%",
    load: "67%",
    activity: "Batching transactions",
    color: "text-blue-400"
  }
];

const LOGS = [
  "TaurusAgent: crypto_trading initiating market_analysis for Asset #1024",
  "MCP_Orchestrator: Connected to @modelcontextprotocol/server-perplexity",
  "Compliance: Verified accredited investor status for User_8829",
  "Hedera: Consensus timestamp reached 16788923.2234",
  "Revenue_Opt: Detected 12% yield arbitrage opportunity",
  "System: Quantum keys rotated (ML-KEM FIPS 203)",
  "TaurusAgent: Executing trade via geometric_mean_reversion strategy",
  "Network: Latency 12ms to Hedera Mirror Node"
];

export default function CommandCenter() {
  const [logs, setLogs] = useState(LOGS);

  // Simulate scrolling logs
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev.slice(1), prev[0]];
        return newLogs;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20 overflow-hidden">
      <Header />
      {/* Animated Background Grid */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{ 
          backgroundImage: `linear-gradient(0deg, rgba(34,197,94,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b-4 border-white pb-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">/// SYSTEM_VIEW</div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Command Center
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-2 justify-end text-green-500 font-bold">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              SYSTEM ONLINE
            </div>
            <div className="text-sm text-gray-400">
              TAURUS INTEGRATION LAYER v2.4.0
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Agent Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENTS.map((agent) => (
                <motion.div 
                  key={agent.id}
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm hover:border-white transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`font-bold text-lg ${agent.color}`}>{agent.name}</div>
                    <Activity className={`w-5 h-5 ${agent.color}`} />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">STATUS</span>
                      <span className="font-bold">{agent.status}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1">
                      <div 
                        className={`h-full bg-gradient-to-r from-accent to-warning`} 
                        style={{ width: agent.load }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>UPTIME: {agent.uptime}</span>
                      <span>LOAD: {agent.load}</span>
                    </div>
                    <div className="text-xs border-t border-gray-800 pt-2 mt-2 text-green-500/80">
                      &gt; {agent.activity}...
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Asset Pipeline Visualization */}
            <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" />
                ASSET TOKENIZATION PIPELINE
              </h3>
              
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-10 hidden md:block" />
                
                {[
                  { label: "Ingestion", icon: Server, status: "COMPLETE" },
                  { label: "AI Analysis", icon: Cpu, status: "PROCESSING" },
                  { label: "Compliance", icon: Shield, status: "PENDING" },
                  { label: "Minting", icon: Lock, status: "QUEUED" }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center bg-black p-4 border border-gray-700 z-10 min-w-[140px]">
                    <step.icon className="w-8 h-8 mb-2 text-accent" />
                    <div className="font-bold text-sm">{step.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{step.status}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar - System Logs & Metrics */}
          <div className="space-y-8">
            
            {/* Account Balance Widget */}
            <AccountBalance />
            
            {/* Terminal Logs */}
            <div className="border-2 border-gray-800 bg-black p-4 h-[400px] overflow-hidden flex flex-col font-mono text-xs">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2 text-gray-400">
                <Terminal className="w-4 h-4" />
                <span>SYSTEM_LOGS</span>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <div className="absolute bottom-0 left-0 w-full space-y-2 pr-4">
                  {logs.map((log, i) => (
                    <div 
                      key={i}
                      className="text-green-500/80 break-words animate-fade-in"
                    >
                      <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Network Stats */}
            <div className="border-2 border-gray-800 bg-gray-900/50 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                NETWORK STATUS
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Hedera Mainnet</span>
                  <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded">CONNECTED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Quantum Node</span>
                  <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded">SECURE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">MCP Server</span>
                  <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded">ACTIVE</span>
                </div>
                
                <div className="pt-4 border-t border-gray-800 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">12ms</div>
                    <div className="text-xs text-gray-500">LATENCY</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">10k+</div>
                    <div className="text-xs text-gray-500">TPS</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
