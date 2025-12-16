import { Play, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function DemoSection() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-24 bg-warning border-b-4 border-black">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl md:text-7xl font-black uppercase mb-12">
          See It In Action
        </h2>
        
        <div className="max-w-4xl mx-auto relative group cursor-pointer mb-12">
          <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
          <div className="relative bg-white border-4 border-black aspect-video flex items-center justify-center overflow-hidden">
            {/* Placeholder for video thumbnail */}
            <div className="absolute inset-0 bg-gray-200 pattern-grid-lg opacity-20"></div>
            
            <div className="z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-accent rounded-none flex items-center justify-center mb-4 hover:scale-110 transition-transform border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Play className="w-10 h-10 text-white fill-white" />
              </div>
              <p className="font-bold uppercase tracking-widest bg-black text-white px-4 py-1">Watch 10min Demo</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => setLocation("/app/cbdc-offline-flow")}
            className="bg-black text-white px-8 py-4 text-lg font-bold uppercase tracking-wider border-2 border-black hover:bg-gray-900 transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            data-testid="button-view-cbdc-architecture"
          >
            View CBDC Offline Architecture <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setLocation("/app/services")}
            className="bg-accent text-white px-8 py-4 text-lg font-bold uppercase tracking-wider border-2 border-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            data-testid="button-launch-app-bottom"
          >
            Launch App <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
