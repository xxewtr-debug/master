import React, { useState } from 'react';
import { Product } from '../types';
import { ArrowRight, Star, ShoppingCart, ShieldCheck, Truck, Share2, Heart, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsProps {
    product: Product;
    onBack: () => void;
    onAddToCart: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart }) => {
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const { toast } = useToast();

    // Use product available sizes or fallback to standard range
    const sizes = product.sizes && product.sizes.length > 0 
        ? product.sizes 
        : [40, 41, 42, 43, 44, 45];

    const handleBuyNow = () => {
        if (!selectedSize) {
            toast({
                title: "اختر المقاس أولاً",
                description: "يرجى اختيار مقاس الحذاء قبل إتمام الطلب",
                variant: "destructive",
            });
            return;
        }
        setIsAnimating(true);
        
        // Create WhatsApp message with product details
        const message = `مرحباً، أريد طلب هذا المنتج:

📦 المنتج: ${product.name}
💰 السعر: ${product.price.toLocaleString()} د.ع
📏 المقاس: ${selectedSize}
🏷️ التصنيف: ${product.category}

🖼️ صورة المنتج:
${window.location.origin}${product.image}`;

        const whatsappUrl = `https://wa.me/9647711963103?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        setTimeout(() => setIsAnimating(false), 500);
    };

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-20 relative overflow-hidden animate-fade-in text-white">
            {/* Dark Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-800/20 rounded-full blur-[150px] pointer-events-none"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                {/* Back Button */}
                <button 
                    onClick={onBack}
                    className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors mb-10 group"
                >
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold-500 group-hover:bg-gold-500/10 transition-all">
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    <span className="font-bold text-lg">العودة للمعرض</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    
                    {/* Image Showcase */}
                    <div className="relative group perspective-[1000px]">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] transform rotate-3 scale-95 opacity-50"></div>
                        <div className="relative bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-[3rem] p-10 lg:p-20 flex items-center justify-center overflow-visible">
                            
                            {/* Glow */}
                            <div className="absolute inset-0 bg-gold-500/5 blur-[50px] rounded-full"></div>

                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="relative z-10 w-full max-w-[600px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6"
                            />

                            {/* Floating Stats */}
                            <div className="absolute -right-6 top-20 glass-premium p-4 rounded-xl border border-white/10 animate-float shadow-xl">
                                <Heart className="text-red-500 fill-red-500" size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-full text-gold-400 text-xs font-bold uppercase tracking-widest">
                                {product.category} Edition
                            </span>
                            <div className="flex items-center gap-1 text-gold-500">
                                <Star size={16} fill="currentColor" />
                                <span className="text-white font-bold ml-1">{product.rating}.0</span>
                            </div>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-white/10">
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">
                                {product.price.toLocaleString()}
                            </span>
                            <span className="text-xl text-slate-500 font-light">د.ع</span>
                        </div>

                        <p className="text-slate-400 text-lg leading-relaxed mb-10">
                            {product.description}
                            <br/>
                            تم تصنيع هذا الحذاء بأعلى معايير الجودة العالمية (Master Quality) ليمنحك مظهراً استثنائياً وراحة لا تضاهى.
                        </p>

                        {/* Size Selection */}
                        <div className="mb-10">
                            <span className="block text-white font-bold mb-4 text-sm uppercase tracking-wide">اختر المقاس</span>
                            <div className="flex flex-wrap gap-3">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-14 rounded-xl font-bold transition-all duration-300 border-2 ${
                                            selectedSize === size
                                            ? 'bg-gold-500 border-gold-500 text-navy-900 shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-110'
                                            : 'bg-transparent border-white/10 text-slate-400 hover:border-gold-500/50 hover:text-white'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            {product.inStock !== false ? (
                                <button 
                                    onClick={handleBuyNow}
                                    className={`flex-1 py-5 bg-white text-black font-black text-lg rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 ${isAnimating ? 'scale-95' : ''}`}
                                    data-testid="button-buy-now"
                                >
                                    <ShoppingCart size={22} className={isAnimating ? 'animate-bounce' : ''} />
                                    شراء الآن
                                </button>
                            ) : (
                                <div 
                                    className="flex-1 py-5 bg-rose-500/10 border-2 border-rose-500/30 text-rose-400 font-black text-lg rounded-xl flex items-center justify-center gap-3 cursor-not-allowed"
                                    data-testid="text-out-of-stock"
                                >
                                    <XCircle size={22} />
                                    نفذت الكمية
                                </div>
                            )}
                            <button className="w-20 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                <Share2 size={24} />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-gold-500" size={24} />
                                <span className="text-sm text-slate-400">جودة أصلية 100%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Truck className="text-gold-500" size={24} />
                                <span className="text-sm text-slate-400">شحن آمن وسريع</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};