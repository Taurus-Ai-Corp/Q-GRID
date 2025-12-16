import concreteTexture from "@assets/generated_images/raw_concrete_wall_texture_with_cracks_and_industrial_grunge.png";

export default function TechStack() {
  return (
    <section className="py-24 bg-black text-white border-b-4 border-black relative overflow-hidden">
       <div 
        className="absolute inset-0 opacity-20 pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: `url(${concreteTexture})`, backgroundSize: 'cover' }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-6xl md:text-8xl font-black uppercase leading-none mb-8">
              Stack<br/>
              <span className="text-stroke-white text-transparent">Overview</span>
            </h2>
            <div className="space-y-6 text-lg font-mono border-l-2 border-white pl-6">
              <p>Built for speed, security, and scale.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-accent inline-block"></span>
                  ML-DSA (NIST FIPS 204)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-warning inline-block"></span>
                  ML-KEM (NIST FIPS 203)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-white inline-block"></span>
                  Hedera Consensus Service
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 inline-block"></span>
                  HYBRID ECDSA+PQC Signing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-white inline-block"></span>
                  React / Wouter / Tailwind
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-8">
             {/* Code Snippet Visualization */}
             <div className="bg-gray-900 border-4 border-white p-6 font-mono text-sm shadow-[8px_8px_0px_0px_#ffffff]">
                <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400">// Quantum Key Generation</div>
                <div className="text-purple-400">const</div> <div className="text-blue-400 inline">mldsa</div> = <div className="text-purple-400 inline">new</div> <div className="text-yellow-400 inline">MLDSACrypto</div>(<div className="text-green-400 inline">"ML-DSA-65"</div>);
                <br/>
                <div className="text-purple-400">const</div> <div className="text-blue-400 inline">keyPair</div> = mldsa.<div className="text-yellow-400 inline">generateKeyPair</div>();
                <br/>
                <div className="text-gray-400 mt-2">// Sign Transaction</div>
                <div className="text-purple-400">const</div> <div className="text-blue-400 inline">signature</div> = mldsa.<div className="text-yellow-400 inline">sign</div>(keyPair.private, <div className="text-green-400 inline">"tx_payload"</div>);
                <br/>
                <div className="mt-4 text-green-500 animate-pulse">
                  &gt; Quantum Security Active...
                </div>
             </div>

             {/* Metrics Grid */}
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-white text-black p-4 border-4 border-transparent hover:border-accent transition-colors">
                 <div className="text-3xl font-black mb-1">10k+</div>
                 <div className="font-bold uppercase text-xs">TPS</div>
               </div>
               <div className="bg-white text-black p-4 border-4 border-transparent hover:border-accent transition-colors">
                 <div className="text-3xl font-black mb-1">3s</div>
                 <div className="font-bold uppercase text-xs">Finality</div>
               </div>
               <div className="bg-white text-black p-4 border-4 border-transparent hover:border-accent transition-colors">
                 <div className="text-3xl font-black mb-1">Low</div>
                 <div className="font-bold uppercase text-xs">Cost</div>
               </div>
               <div className="bg-accent text-white p-4 border-4 border-transparent hover:border-white transition-colors">
                 <div className="text-3xl font-black mb-1">100%</div>
                 <div className="font-bold uppercase text-xs">Safe</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
