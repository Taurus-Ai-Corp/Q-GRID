import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Lock, Globe, Activity } from "lucide-react";
import { useLocation } from "wouter";
import glitchTexture from "@assets/generated_images/abstract_digital_noise_glitch_texture,_black_and_white.png";

export default function Hero() {
  const [, setLocation] = useLocation();

  return (
    <section className="relative min-h-screen flex flex-col justify-center border-b-4 border-black overflow-hidden font-bold">
      {/* Background Noise */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: `url(${glitchTexture})`, backgroundSize: 'cover' }}
      />
      <div className="container mx-auto px-4 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="max-w-6xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-accent text-white px-2 py-1 text-sm font-bold uppercase tracking-widest border border-black">
              NIST FIPS 203/204 Compliant
            </span>
            <span className="bg-warning text-black px-2 py-1 text-sm font-bold uppercase tracking-widest border border-black">
              Hedera Hashgraph
            </span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter mb-8">
            QUANTUM<br />
            <span className="text-stroke text-transparent hover:text-black transition-colors duration-300">RESISTANCE</span><br />
            IS NOW.
          </h1>

          <p className="text-xl md:text-2xl max-w-2xl font-medium mb-12 bg-white border border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            The world's first quantum-resistant blockchain platform. 
            Securing the $Trillion economy against the 2030 threat window.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => setLocation("/app/services")}
              className="bg-accent text-white px-8 py-4 text-xl font-bold uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white transition-all hover:translate-x-[4px] hover:translate-y-[4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none flex items-center gap-2"
              data-testid="button-launch-app"
            >
              Launch App <ArrowRight className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setLocation("/app/quantum-rupee-platform")}
              className="bg-white text-black px-8 py-4 text-xl font-bold uppercase tracking-wider border-2 border-black hover:bg-gray-100 transition-all hover:translate-x-[4px] hover:translate-y-[4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
              data-testid="button-quantum-rupee-platform"
            >
              Quantum-Rupee™
            </button>
          </div>
        </motion.div>
      </div>
      {/* Marquee at bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-black text-white py-3 border-t-4 border-black overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="mx-8 font-mono uppercase text-sm font-bold">/// SYSTEM STATUS: SECURE</span>
          <span className="mx-8 font-mono uppercase text-sm font-bold">/// ML-DSA: ACTIVE</span>
          <span className="mx-8 font-mono uppercase text-sm font-bold">/// ML-KEM: ACTIVE</span>
          <span className="mx-8 font-mono uppercase text-sm font-bold">/// HEDERA TPS: 10,000+</span>
          <span className="mx-8 font-mono uppercase text-sm font-bold">/// FINALITY: 3S</span>
          <span className="mx-8 font-mono uppercase text-sm font-bold">/// SYSTEM STATUS: SECURE</span>
          <span className="mx-8 font-mono uppercase text-sm font-bold">/// ML-DSA: ACTIVE</span>
          <span className="mx-8 font-mono uppercase text-sm font-bold">/// ML-KEM: ACTIVE</span>
        </div>
      </div>
    </section>
  );
}
