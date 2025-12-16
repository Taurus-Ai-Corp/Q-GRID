import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Lock, Zap, Shield, Code2, FileCheck } from "lucide-react";

interface Service {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  x: number;
  y: number;
}

export default function BigBang() {
  const [, setLocation] = useLocation();
  const [services, setServices] = useState<Service[]>([]);
  const [showServices, setShowServices] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<"bang" | "constellation" | "complete">("bang");

  useEffect(() => {
    // Initialize services with random scattered positions
    const newServices: Service[] = [
      {
        id: "qkd",
        label: "QKD",
        icon: <Lock className="w-8 h-8" />,
        description: "Quantum Cryptography",
        color: "#FF00FF",
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
      {
        id: "rupee",
        label: "Quantum-Rupee",
        icon: <Zap className="w-8 h-8" />,
        description: "CBDC & Blockchain",
        color: "#00FFFF",
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
      {
        id: "kyc",
        label: "QT-KYC",
        icon: <Shield className="w-8 h-8" />,
        description: "Identity Services",
        color: "#FFFF00",
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
      {
        id: "audit",
        label: "Q-Reg",
        icon: <FileCheck className="w-8 h-8" />,
        description: "Compliance Automation",
        color: "#00FF00",
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
      {
        id: "devops",
        label: "DevOps",
        icon: <Code2 className="w-8 h-8" />,
        description: "Developer Training",
        color: "#FF6B00",
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
    ];

    setServices(newServices);
    setShowServices(true);

    // Phase progression
    const bangTimer = setTimeout(() => setAnimationPhase("constellation"), 1500);
    const completeTimer = setTimeout(() => setAnimationPhase("complete"), 3500);

    return () => {
      clearTimeout(bangTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const handleServiceClick = (serviceId: string) => {
    setTimeout(() => {
      setLocation("/auth");
    }, 300);
  };

  useEffect(() => {
    if (animationPhase === "complete") {
      const redirectTimer = setTimeout(() => {
        setLocation("/auth");
      }, 2000);
      return () => clearTimeout(redirectTimer);
    }
  }, [animationPhase, setLocation]);

  if (!showServices) return null;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <style>{`
        @keyframes bang-burst {
          0% {
            transform: translate(50vw, 50vh) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(1);
            opacity: 0.8;
          }
        }

        @keyframes constellation-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes glitch-1 {
          0% { clip-path: polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%); }
          20% { clip-path: polygon(0% 20%, 100% 0%, 100% 60%, 0% 70%); }
          40% { clip-path: polygon(0% 0%, 100% 30%, 100% 50%, 0% 30%); }
          60% { clip-path: polygon(0% 10%, 100% 0%, 100% 70%, 0% 50%); }
          80% { clip-path: polygon(0% 0%, 100% 20%, 100% 50%, 0% 60%); }
          100% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
        }

        @keyframes matrix-flicker {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.1; }
        }

        @keyframes fade-in-service {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .service-particle {
          animation: bang-burst 1.5s ease-out forwards;
        }

        .constellation-point {
          animation: constellation-pulse 2s ease-in-out infinite;
        }

        .glitch-effect {
          animation: glitch-1 4s linear infinite;
        }

        .matrix-bg {
          animation: matrix-flicker 0.3s infinite;
        }
      `}</style>

      {/* Matrix Background Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="matrix-bg w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Animated Background Glitch */}
      {animationPhase !== "complete" && (
        <div
          className="absolute inset-0 glitch-effect pointer-events-none"
          style={{
            background: "linear-gradient(45deg, rgba(255, 0, 255, 0.05) 0%, rgba(0, 255, 255, 0.05) 100%)",
          }}
        />
      )}

      {/* Constellation Lines (visible in constellation phase) */}
      {animationPhase === "constellation" && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Draw lines connecting services */}
          {services.map((service, i) => {
            const nextService = services[(i + 1) % services.length];
            const x1 = (service.x / 100) * window.innerWidth;
            const y1 = (service.y / 100) * window.innerHeight;
            const x2 = (nextService.x / 100) * window.innerWidth;
            const y2 = (nextService.y / 100) * window.innerHeight;
            return (
              <line
                key={`line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`rgba(255, 255, 0, ${animationPhase === "constellation" ? 0.3 : 0})`}
                strokeWidth="1"
                filter="url(#glow)"
                style={{
                  transition: "stroke-opacity 0.5s ease",
                  strokeOpacity: animationPhase === "constellation" ? 0.3 : 0,
                }}
              />
            );
          })}
        </svg>
      )}

      {/* Service Particles */}
      {services.map((service, index) => (
        <div
          key={service.id}
          className="service-particle absolute cursor-pointer"
          style={{
            "--tx": `calc(${service.x}vw - 40px)`,
            "--ty": `calc(${service.y}vh - 40px)`,
            left: "50vw",
            top: "50vh",
            width: "80px",
            height: "80px",
          } as React.CSSProperties & { "--tx": string; "--ty": string }}
          onClick={() => handleServiceClick(service.id)}
        >
          {/* Glow Effect */}
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, ${service.color}80 0%, transparent 70%)`,
              opacity: animationPhase === "constellation" ? 1 : 0.6,
            }}
          />

          {/* Service Card */}
          <div
            className={`absolute inset-0 flex items-center justify-center border-2 rounded-full transition-all duration-300 ${
              animationPhase === "constellation"
                ? "constellation-point hover:scale-125"
                : ""
            }`}
            style={{
              borderColor: service.color,
              background: `rgba(0, 0, 0, 0.7)`,
              color: service.color,
              boxShadow: `0 0 20px ${service.color}`,
              opacity: animationPhase === "bang" ? 0.8 : 1,
            }}
          >
            {service.icon}
          </div>

          {/* Label (visible in constellation phase) */}
          {animationPhase === "constellation" && (
            <div
              className="absolute top-full mt-2 text-center font-bold text-xs whitespace-nowrap"
              style={{ left: "-50px", width: "180px", color: service.color }}
            >
              <div className="font-black">{service.label}</div>
              <div className="text-xs text-gray-400 mt-1">{service.description}</div>
            </div>
          )}
        </div>
      ))}

      {/* Center Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {animationPhase === "bang" && (
          <div className="text-center opacity-50 animate-pulse">
            <div className="text-4xl font-black text-accent">QUANTUM</div>
            <div className="text-sm text-gray-400 mt-2">INITIATION SEQUENCE</div>
          </div>
        )}
        {animationPhase === "constellation" && (
          <div className="text-center">
            <div className="text-3xl font-black text-accent mb-4">QUANTUM SERVICES NETWORK</div>
            <div className="text-xs text-gray-400">Click any service to continue</div>
          </div>
        )}
      </div>

      {/* Auto-redirect after constellation phase */}
      {animationPhase === "complete" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-5xl font-black text-accent mb-4 animate-pulse">Q_GRID</div>
            <div className="text-gray-400">Accessing secure portal...</div>
          </div>
        </div>
      )}
    </div>
  );
}
