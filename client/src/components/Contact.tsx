import React from 'react';
import { MapPin, Phone, Instagram, Facebook, MessageCircle } from 'lucide-react';

export const Contact: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-transparent">
            
            {/* Background Ambience for this section */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-navy-900/50 rounded-full blur-[120px] pointer-events-none z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-gold-500 text-sm font-bold tracking-[0.3em] uppercase mb-2 block">Customer Support</span>
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 drop-shadow-xl">نحن هنا لخدمتك</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">فريق خدمة العملاء جاهز للرد على استفساراتك وتلبية طلباتك الخاصة - دعم 24 ساعة</p>
                </div>

                <div className="flex justify-center max-w-2xl mx-auto">
                    
                    {/* Contact Info Card (Luxury Dark Card) */}
                    <div className="w-full">
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group hover:border-gold-500/30 transition-colors duration-500">
                            
                            {/* Decorative Shine */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-gold-500/20 transition-all"></div>

                            <h3 className="text-2xl font-bold text-white mb-8 relative z-10 flex items-center gap-3">
                                <span className="w-2 h-8 bg-gold-500 rounded-full"></span>
                                معلومات الاتصال
                            </h3>
                            
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gold-500 border border-white/5 group-hover/item:bg-gold-500 group-hover/item:text-navy-900 transition-all duration-300 shadow-lg">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">اتصل بنا</p>
                                        <p className="text-xl font-black text-white dir-ltr text-right font-mono tracking-wide">0771 196 3103</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gold-500 border border-white/5 group-hover/item:bg-gold-500 group-hover/item:text-navy-900 transition-all duration-300 shadow-lg">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">الموقع</p>
                                        <p className="text-white font-bold leading-relaxed">العراق، بابل<br/>المسيب شارع الحسينيه</p>
                                    </div>
                                </div>

                            </div>
                            
                            <div className="mt-12 flex gap-3 relative z-10 pt-8 border-t border-white/5">
                                <a 
                                    href="https://www.instagram.com/fashion_dubay1" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-white/5 rounded-xl text-slate-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5 group/social"
                                    data-testid="link-instagram"
                                >
                                    <Instagram size={20} className="group-hover/social:scale-110 transition-transform" />
                                </a>
                                <a 
                                    href="https://www.facebook.com/share/19WHDGukDZ/?mibextid=wwXIfr" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-white/5 rounded-xl text-slate-300 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5 group/social"
                                    data-testid="link-facebook"
                                >
                                    <Facebook size={20} className="group-hover/social:scale-110 transition-transform" />
                                </a>
                                <a 
                                    href="https://wa.me/9647711963103" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-white/5 rounded-xl text-slate-300 hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5 group/social"
                                    data-testid="link-whatsapp"
                                >
                                    <MessageCircle size={20} className="group-hover/social:scale-110 transition-transform" />
                                </a>
                                <a 
                                    href="https://www.tiktok.com/@amlkhg" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-white/5 rounded-xl text-slate-300 hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5 group/social"
                                    data-testid="link-tiktok"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="group-hover/social:scale-110 transition-transform">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};