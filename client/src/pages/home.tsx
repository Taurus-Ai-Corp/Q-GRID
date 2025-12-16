import Header from "@/components/Header";
import Hero from "@/components/hero";
import Features from "@/components/features";
import TechStack from "@/components/tech-stack";
import DemoSection from "@/components/demo-section";
import CryptoGridLogo from "@/components/crypto-grid-logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-accent selection:text-white">
      <Header />
      <div className="pt-20">
        <Hero />
        <Features />
        <TechStack />
        <DemoSection />
        
        <footer className="bg-black text-white py-12 border-t-4 border-accent">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <h3 className="text-4xl font-black uppercase mb-4">Q_GRID</h3>
                <p className="font-mono text-gray-400 max-w-md">
                  Securing the future of blockchain infrastructure against the quantum threat. Built on Hedera.
                </p>
              </div>
              <div>
                <h4 className="font-bold uppercase mb-4 text-accent">Platform</h4>
                <ul className="space-y-2 font-mono text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white">Quantum Core</a></li>
                  <li><a href="#" className="hover:text-white">Hedera Integration</a></li>
                  <li><a href="#" className="hover:text-white">Healthcare</a></li>
                  <li><a href="#" className="hover:text-white">CBDC</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold uppercase mb-4 text-accent">Legal</h4>
                <ul className="space-y-2 font-mono text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white">Whitepaper</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 flex justify-between items-center font-mono text-xs text-gray-500">
              <div>© 2025 Q_GRID. ALL RIGHTS RESERVED.</div>
              <div>SYSTEM STATUS: ONLINE</div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
