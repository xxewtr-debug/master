import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const PromoBanner: React.FC = () => {
    return (
        <section className="w-full py-0 my-24 relative overflow-hidden border-y border-white/5 bg-[#050914]">
            
            {/* 1. Background Architecture - Perfectly Straight Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#020617] via-transparent to-[#020617] z-10"></div>
            
            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4 lg:px-12 relative z-20 h-full">
                <div className="flex flex-col lg:flex-row items-center justify-between h-full py-20 lg:py-32 gap-12 lg:gap-0">
                    
                    {/* Content Section (Right Aligned) */}
                    <div className="lg:w-1/2 text-center lg:text-right order-2 lg:order-1">
                        
                        {/* Title - Clean & Massive */}
                        <h2 className="text-5xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                            الصفقة
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-gold-300 via-gold-500 to-gold-700">الماسية</span>
                        </h2>

                        <p className="text-slate-400 text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 mb-10 font-light leading-relaxed border-r border-gold-500/30 pr-6">
                            تمتع بخصم حصري <span className="text-white font-bold">40%</span> على مجموعة "Black Label".
                            <br/>
                            فرصة لاقتناء الفخامة بسعر استثنائي.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <button className="px-12 py-5 bg-white text-navy-950 font-black rounded-sm hover:bg-gold-500 transition-all duration-300 flex items-center justify-center gap-3 group min-w-[200px] shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <span>اكتشف العرض</span>
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Image Section (Straight & Stable) */}
                    <div className="lg:w-1/2 relative order-1 lg:order-2 flex justify-center items-center">
                        
                        {/* Pedestal Shadow */}
                        <div className="absolute bottom-5 w-[350px] h-[30px] bg-black rounded-[100%] blur-2xl opacity-90"></div>
                        
                        {/* The Shoe - Zero Rotation */}
                        <div className="relative z-10 transition-transform duration-700 hover:scale-105">
                             <img 
                                src="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=1000" 
                                alt="Diamond Deal" 
                                className="w-full max-w-[600px] object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
                            />
                            
                            {/* Straight Discount Tag */}
                            <div className="absolute top-10 right-0 lg:right-10 bg-gold-500 text-navy-950 px-6 py-4 font-black text-2xl shadow-[0_10px_40px_rgba(212,175,55,0.3)]">
                                -40%
                            </div>
                        </div>

                        {/* Minimal Particles */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <Sparkles className="absolute top-0 right-10 text-gold-500 w-8 h-8 opacity-50 animate-pulse" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};