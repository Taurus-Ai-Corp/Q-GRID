import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Building2, Users, Briefcase, Code2, ArrowRight } from "lucide-react";

type UserType = "customer" | "business" | "enterprise" | "nbfc" | "fintech" | null;

export default function AuthPortal() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<UserType>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setShowForm(true);
  }, []);

  const userTypes = [
    {
      id: "customer",
      label: "Individual",
      description: "Personal CBDC wallet & payments",
      icon: Users,
      color: "#FFFF00",
    },
    {
      id: "business",
      label: "Business",
      description: "SME & merchant services",
      icon: Briefcase,
      color: "#00FFFF",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      description: "Large-scale operations",
      icon: Building2,
      color: "#FF00FF",
    },
    {
      id: "nbfc",
      label: "NBFC",
      description: "Non-Banking Financial Company",
      icon: Code2,
      color: "#00FF00",
    },
    {
      id: "fintech",
      label: "Fintech",
      description: "Financial technology partners",
      icon: Building2,
      color: "#FF6B00",
    },
  ];

  const handleContinue = () => {
    if (selectedType) {
      window.location.href = `/api/login?type=${selectedType}`;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
          className="w-full h-full"
        />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="text-xs tracking-widest text-accent mb-2">PORTAL ACCESS</div>
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tight">
            <span className="text-accent">QUANTUM_GRID</span>
          </h1>
          <p className="text-gray-400 text-lg">Select your account type to continue</p>
        </div>

        {/* User Type Selection */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12 transition-all duration-500 ${
            showForm ? "opacity-100" : "opacity-0"
          }`}
        >
          {userTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as UserType)}
                className={`group relative p-6 border-2 transition-all duration-300 ${
                  isSelected
                    ? `border-white bg-white/10`
                    : `border-gray-700 hover:border-accent bg-gray-900/30 hover:bg-gray-900/60`
                }`}
                data-testid={`button-user-type-${type.id}`}
              >
                <div
                  className={`absolute inset-0 opacity-0 ${
                    isSelected ? "opacity-20" : "group-hover:opacity-10"
                  } transition-opacity`}
                  style={{ backgroundColor: type.color }}
                />
                <div className="relative z-10">
                  <Icon
                    className="w-10 h-10 mx-auto mb-4 transition-all"
                    style={{ color: isSelected ? type.color : "#999" }}
                  />
                  <h3 className="font-bold text-sm uppercase mb-2">{type.label}</h3>
                  <p className="text-xs text-gray-400 leading-tight">{type.description}</p>
                  {isSelected && (
                    <div className="mt-4 text-xs text-accent font-bold">✓ SELECTED</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Login/Signup Buttons */}
        <div className="max-w-2xl mx-auto border-2 border-accent/30 bg-black/40 backdrop-blur-sm p-8">
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-center">
              {selectedType ? "Continue to Authentication" : "Select Account Type First"}
            </h2>
            <p className="text-gray-400 text-sm text-center">
              {selectedType
                ? `You are signing up as: ${
                    userTypes.find((t) => t.id === selectedType)?.label
                  }`
                : "Choose one of the account types above"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                if (selectedType) window.location.href = "/api/login";
              }}
              disabled={!selectedType}
              data-testid="button-signin"
              className={`flex-1 py-4 px-6 font-bold uppercase transition-all flex items-center justify-center gap-2 border-2 ${
                selectedType
                  ? "bg-accent text-black border-accent hover:bg-white cursor-pointer"
                  : "bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed"
              }`}
            >
              SIGN IN
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Secure OpenID Connect • Multi-provider OAuth</p>
            <p className="mt-2">Google • GitHub • Apple • Email/Password</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-xs">
          <p>EST. 2025 /// QUANTUM INFRASTRUCTURE AS A SERVICE</p>
          <p className="mt-2">TAURUS AI CORP. // ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </div>
  );
}
