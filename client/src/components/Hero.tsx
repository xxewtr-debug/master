import React from 'react';
import { ArrowLeft, Play } from 'lucide-react';

interface HeroProps {
    onShopNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
    return (
        <section className="relative flex items-center justify-center overflow-hidden py-32 lg:py-52 min-h-[90vh]">
            
            {/* 1. Background Atmosphere - Enhanced */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-blue-900/10 blur-[130px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[150px]"></div>
            </div>

            {/* 2. Background Typography */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none overflow-hidden">
                <span className="text-[25vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent leading-none tracking-tighter scale-125 blur-[4px]">
                    MASTER
                </span>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
                    
                    {/* 3. The Content - Scaled Up */}
                    <div className="lg:w-5/12 text-center lg:text-right order-2 lg:order-1">
                        
                        <div className="inline-flex items-center gap-3 mb-6 animate-fade-in">
                            <span className="h-[2px] w-12 bg-gold-500 shadow-[0_0_10px_#d4af37]"></span>
                            <span className="text-gold-500 tracking-[0.4em] text-xs font-bold uppercase drop-shadow-sm">2025 Luxury Collection</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-8 tracking-tighter drop-shadow-2xl">
                            فخامة الماستر <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-500 to-gold-700 filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">بلمسة أسطورية</span>
                        </h1>

                        <p className="text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-light border-r-2 border-white/10 pr-8 backdrop-blur-sm">
                             اكتشف تشكيلة الأحذية الحصرية المصممة للنخبة، حيث تجتمع دقة التصنيع العالمية مع رفاهية لا تضاهى.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <button 
                                onClick={onShopNow}
                                className="px-10 py-4 bg-white text-black font-black rounded-sm hover:bg-gold-500 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_80px_rgba(212,175,55,0.5)] flex items-center justify-center gap-3 group text-base sm:text-lg tracking-wide relative overflow-hidden"
                            >
                                <span className="relative z-10 text-black">تسوق الآن</span>
                                <ArrowLeft size={22} className="relative z-10 text-black group-hover:-translate-x-1 transition-transform" />
                            </button>
                            
                            <button className="w-14 h-14 border border-white/20 flex items-center justify-center rounded-full hover:border-gold-500 hover:text-gold-500 text-slate-400 transition-all group backdrop-blur-md bg-white/5 hover:bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                <Play size={20} className="ml-1 fill-current group-hover:scale-110 transition-transform" />
                            </button>
                        </div>


                    </div>

                    {/* 4. The Masterpiece (Image - Static & Majestic) */}
                    <div className="lg:w-7/12 relative flex items-center justify-center order-1 lg:order-2 h-[400px] lg:h-[700px]">
                        
                        {/* Soft Pedestal Shadow */}
                        <div className="absolute bottom-[10%] w-[350px] h-[30px] bg-black/80 blur-[40px] rounded-[100%]"></div>

                        {/* The Shoe - Completely Static (Removed Mouse Interaction) */}
                        <div className="relative z-20 w-full max-w-[800px]">
                            {/* Radial gradient mask creates the fading effect into the background */}
                             <img 
                                src="https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=1600" 
                                alt="Master Quality Shoe" 
                                className="w-full h-full object-contain [mask-image:radial-gradient(circle_at_center,black_45%,transparent_75%)] scale-110 drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};