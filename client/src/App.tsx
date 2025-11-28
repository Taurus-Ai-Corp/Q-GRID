import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { initializeFromEnv } from "@/lib/env-loader";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import QGridLanding from "@/pages/qgrid-landing";
import BigBang from "@/pages/big-bang";
import AuthPortal from "@/pages/auth-portal";
import QuantumRupeeLogin from "@/pages/landing";
import Home from "@/pages/home";
import CommandCenter from "@/pages/command-center";
import Accounts from "@/pages/accounts";
import Monitoring from "@/pages/monitoring";
import Setup from "@/pages/setup";
import Services from "@/pages/services";
import KYCService from "@/pages/kyc-service";
import CBDCService from "@/pages/cbdc-service";
import CBDCOfflineFlow from "@/pages/cbdc-offline-flow";
import CBDCPaymentPlatform from "@/pages/cbdc-payment-platform";
import FraudService from "@/pages/fraud-service";
import PQCSigService from "@/pages/pqc-sig-service";
import QuantumRupeePlatform from "@/pages/quantum-rupee-platform";
import AgentHub from "@/pages/agent-hub";

function Router() {
  return (
    <Switch>
      {/* Public Q-Grid landing page */}
      <Route path="/" component={QGridLanding} />
      
      {/* Big Bang animation sequence */}
      <Route path="/big-bang" component={BigBang} />
      
      {/* Authentication Portal (user type selection) */}
      <Route path="/auth" component={AuthPortal} />
      
      {/* QUANTUM RUPEE login page */}
      <Route path="/app/login" component={QuantumRupeeLogin} />
      
      {/* Authenticated QUANTUM RUPEE app routes */}
      <Route path="/app" component={Home} />
      <Route path="/app/services" component={Services} />
      <Route path="/app/quantum-rupee-platform" component={QuantumRupeePlatform} />
      <Route path="/app/kyc-service" component={KYCService} />
      <Route path="/app/cbdc-service" component={CBDCService} />
      <Route path="/app/cbdc-offline-flow" component={CBDCOfflineFlow} />
      <Route path="/app/cbdc-payment-platform" component={CBDCPaymentPlatform} />
      <Route path="/app/fraud-service" component={FraudService} />
      <Route path="/app/pqc-sig-service" component={PQCSigService} />
      <Route path="/app/agent-hub" component={AgentHub} />
      <Route path="/app/setup" component={Setup} />
      <Route path="/app/command-center" component={CommandCenter} />
      <Route path="/app/accounts" component={Accounts} />
      <Route path="/app/monitoring" component={Monitoring} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize Hedera client from environment variables on app load
    initializeFromEnv();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
