import React from 'react';
import { ShieldCheck, Truck, Gem, Headphones, CheckCircle2 } from 'lucide-react';

export const Features: React.FC = () => {
    return (
        <section className="py-24 bg-transparent relative z-20">
            <div className="container mx-auto px-4">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white mb-2">
                            تميز مع <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">الأفضل</span>
                        </h2>
                        <p className="text-slate-400">نقدم لك معايير لا تقبل المنافسة</p>
                    </div>
                    <div className="h-[1px] flex-1 bg-white/10 mx-6 hidden md:block mb-4"></div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                    
                    {/* Card 1: Large (Span 2) - Quality */}
                    <div className="md:col-span-2 bg-[#0a0f1c] rounded-[2rem] p-8 relative overflow-hidden group border border-white/5 hover:border-gold-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[100px] group-hover:bg-gold-500/20 transition-all"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between items-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-700 rounded-2xl flex items-center justify-center text-navy-950 shadow-lg mb-6">
                                <Gem size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-3">فخامة الماستر كواليتي</h3>
                                <p className="text-slate-400 leading-relaxed max-w-lg">
                                    نضمن لك منتجات تطابق الأصل بنسبة 98% في الخامات، الوزن، والتفاصيل الدقيقة. لا يمكن تمييزها بالعين المجردة.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Tall (Span 1, Row 2) - Shipping */}
                    <div className="md:row-span-2 bg-[#0F172A] rounded-[2rem] p-8 relative overflow-hidden group border border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between">
                         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                         
                         <div>
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-white/10">
                                <Truck size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">شحن سريع ومؤمن</h3>
                            <p className="text-slate-400 text-sm">توصيل لكافة محافظات العراق مع تغليف فاخر يحمي المنتج.</p>
                         </div>

                         <div className="mt-8 space-y-3">
                             {['المسيب: 24 ساعة', 'المحافظات: 48 ساعة', 'عروضنا: يومياً عرض جديد'].map((item, i) => (
                                 <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-black/20 p-2 rounded-lg">
                                     <CheckCircle2 size={12} className="text-blue-400" /> {item}
                                 </div>
                             ))}
                         </div>
                    </div>

                    {/* Card 3: Standard - Warranty */}
                    <div className="bg-[#0a0f1c] rounded-[2rem] p-8 relative overflow-hidden group border border-white/5 hover:border-green-500/30 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-400 mb-4 border border-white/10">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">حق الفحص</h3>
                            <p className="text-slate-400 text-sm">افحص طلبك عند الاستلام. لا يعجبك؟ لا تستلم.</p>
                        </div>
                    </div>

                    {/* Card 4: Standard - Support */}
                    <div className="bg-[#0a0f1c] rounded-[2rem] p-8 relative overflow-hidden group border border-white/5 hover:border-purple-500/30 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-purple-400 mb-4 border border-white/10">
                                <Headphones size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">دعم 24</h3>
                            <p className="text-slate-400 text-sm">فريق متخصص لمساعدتك في اختيار المقاس المناسب.</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};