import { useEffect, useState } from "react";
import { Activity, AlertTriangle, TrendingUp, Server, Zap, Clock } from "lucide-react";
import Header from "@/components/Header";

interface Metric {
  name: string;
  value: string | number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  icon: React.ReactNode;
}

export default function Monitoring() {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      name: "Transaction Success Rate",
      value: "99.8",
      unit: "%",
      status: "healthy",
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      name: "Average Latency",
      value: "245",
      unit: "ms",
      status: "healthy",
      icon: <Clock className="w-5 h-5" />
    },
    {
      name: "Hedera Network Status",
      value: "Connected",
      unit: "Mainnet",
      status: "healthy",
      icon: <Server className="w-5 h-5" />
    },
    {
      name: "MCP Server Status",
      value: "Ready",
      unit: "2 endpoints",
      status: "healthy",
      icon: <Zap className="w-5 h-5" />
    }
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      level: "info",
      message: "Quantum cryptography upgrade scheduled for Q2 2025",
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      level: "info",
      message: "MCP servers operational and listening",
      timestamp: new Date(Date.now() - 1800000)
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500 bg-green-500/10 border-green-700";
      case "warning":
        return "text-warning bg-warning/10 border-warning/30";
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-700";
      default:
        return "text-gray-500";
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case "critical":
        return "border-l-red-500";
      case "warning":
        return "border-l-warning";
      case "info":
        return "border-l-accent";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-20">
      <Header />
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b-4 border-white pb-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">/// MONITORING</div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              System Monitoring
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-2 justify-end text-green-500 font-bold">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              ALL SYSTEMS OPERATIONAL
            </div>
            <div className="text-sm text-gray-400">
              Uptime: 99.97% (Last 30 days)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className={`border-2 p-4 backdrop-blur-sm ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="opacity-75">{metric.icon}</div>
                <span className="text-xs font-bold uppercase">
                  {metric.status === "healthy" && "✅"}
                  {metric.status === "warning" && "⚠️"}
                  {metric.status === "critical" && "❌"}
                </span>
              </div>
              <div className="text-2xl font-black mb-1">
                {metric.value}
                <span className="text-lg text-gray-400 ml-1">{metric.unit}</span>
              </div>
              <div className="text-xs text-gray-500">{metric.name}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts */}
          <div className="lg:col-span-2 border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              SYSTEM ALERTS
            </h2>

            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">No active alerts</div>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-l-4 p-4 bg-black ${getAlertColor(alert.level)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold uppercase text-sm mb-1">
                          {alert.level === "critical" && "🔴 CRITICAL"}
                          {alert.level === "warning" && "🟡 WARNING"}
                          {alert.level === "info" && "🔵 INFO"}
                        </div>
                        <div className="text-sm">{alert.message}</div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Service Status */}
          <div className="border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-accent" />
              SERVICES
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-black border-l-4 border-green-500">
                <div>
                  <div className="font-bold text-sm">Hedera Integration</div>
                  <div className="text-xs text-gray-500">Connected</div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>

              <div className="flex justify-between items-center p-3 bg-black border-l-4 border-green-500">
                <div>
                  <div className="font-bold text-sm">MCP Quantum Server</div>
                  <div className="text-xs text-gray-500">Listening</div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>

              <div className="flex justify-between items-center p-3 bg-black border-l-4 border-green-500">
                <div>
                  <div className="font-bold text-sm">MCP Hedera Server</div>
                  <div className="text-xs text-gray-500">Listening</div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>

              <div className="flex justify-between items-center p-3 bg-black border-l-4 border-warning">
                <div>
                  <div className="font-bold text-sm">Database</div>
                  <div className="text-xs text-gray-500">Mock Data</div>
                </div>
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* MCP Server Info */}
        <div className="mt-8 border-2 border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            MCP SERVER ENDPOINTS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-black border border-gray-700">
              <div className="font-bold text-accent mb-2">Quantum Crypto MCP</div>
              <div className="text-xs font-mono text-gray-400 mb-3">
                Endpoint: http://localhost:8010/quantum
              </div>
              <div className="text-xs space-y-1 text-gray-500">
                <div>✓ ML-DSA key generation</div>
                <div>✓ ML-KEM encapsulation</div>
                <div>✓ Signature verification</div>
                <div>✓ Crypto agility status</div>
              </div>
            </div>

            <div className="p-4 bg-black border border-gray-700">
              <div className="font-bold text-accent mb-2">Hedera MCP</div>
              <div className="text-xs font-mono text-gray-400 mb-3">
                Endpoint: http://localhost:8011/hedera
              </div>
              <div className="text-xs space-y-1 text-gray-500">
                <div>✓ Account initialization</div>
                <div>✓ Token creation (HTS)</div>
                <div>✓ Token transfers</div>
                <div>✓ Balance queries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
