import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { ArrowRight, Star, ShoppingCart, ShieldCheck, Truck, Share2, Heart, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsProps {
    product: Product;
    onBack: () => void;
    onAddToCart: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart }) => {
    const [selectedSize, setSelectedSize] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [userInteracted, setUserInteracted] = useState(false);
    const resumeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const touchStartRef = React.useRef<number | null>(null);
    const touchDeltaRef = React.useRef<number>(0);
    const [swiping, setSwiping] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const { toast } = useToast();

    const allImages = [product.image, ...(product.images || [])];
    const hasMultipleImages = allImages.length > 1;

    const pauseAutoSlide = useCallback(() => {
        setUserInteracted(true);
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = setTimeout(() => {
            setUserInteracted(false);
        }, 6000);
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev + 1) % allImages.length);
    }, [allImages.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide(prev => (prev - 1 + allImages.length) % allImages.length);
    }, [allImages.length]);

    const handleManualNext = useCallback(() => {
        pauseAutoSlide();
        nextSlide();
    }, [pauseAutoSlide, nextSlide]);

    const handleManualPrev = useCallback(() => {
        pauseAutoSlide();
        prevSlide();
    }, [pauseAutoSlide, prevSlide]);

    const handleManualSelect = useCallback((index: number) => {
        pauseAutoSlide();
        setCurrentSlide(index);
    }, [pauseAutoSlide]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX;
        touchDeltaRef.current = 0;
        setSwiping(true);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (touchStartRef.current === null) return;
        const delta = e.touches[0].clientX - touchStartRef.current;
        touchDeltaRef.current = delta;
        setSwipeOffset(delta);
    }, []);

    const handleTouchEnd = useCallback(() => {
        const delta = touchDeltaRef.current;
        setSwiping(false);
        setSwipeOffset(0);
        touchStartRef.current = null;
        const threshold = 50;
        if (delta < -threshold) {
            handleManualNext();
        } else if (delta > threshold) {
            handleManualPrev();
        }
    }, [handleManualNext, handleManualPrev]);

    useEffect(() => {
        if (!hasMultipleImages || userInteracted) return;
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [hasMultipleImages, nextSlide, userInteracted]);

    useEffect(() => {
        return () => {
            if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        };
    }, []);

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
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-800/20 rounded-full blur-[150px] pointer-events-none"></div>
            
            <div className="container mx-auto px-4 relative z-10">
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
                    
                    <div className="relative group perspective-[1000px]">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[3rem] transform rotate-3 scale-95 opacity-50"></div>
                        <div className="relative bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-[3rem] p-6 lg:p-10 flex items-center justify-center overflow-hidden min-h-[400px] lg:min-h-[550px]">
                            
                            <div className="absolute inset-0 bg-gold-500/5 blur-[50px] rounded-full"></div>

                            {hasMultipleImages ? (
                                <div className="relative w-full">
                                    <div 
                                        className="relative overflow-hidden rounded-2xl touch-pan-y"
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <div 
                                            className={`flex ${swiping ? '' : 'transition-transform duration-700 ease-in-out'}`}
                                            style={{ transform: `translateX(calc(-${currentSlide * 100}% + ${swiping ? swipeOffset : 0}px))` }}
                                        >
                                            {allImages.map((img, index) => (
                                                <img 
                                                    key={index}
                                                    src={img} 
                                                    alt={`${product.name} - ${index + 1}`}
                                                    className="relative z-10 w-full h-[350px] lg:h-[500px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] shrink-0"
                                                    style={{ minWidth: '100%' }}
                                                    data-testid={`img-product-slide-${index}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleManualPrev}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all"
                                        data-testid="button-prev-slide"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                    <button 
                                        onClick={handleManualNext}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all"
                                        data-testid="button-next-slide"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                                        {allImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleManualSelect(index)}
                                                className={`transition-all duration-300 rounded-full ${
                                                    currentSlide === index 
                                                    ? 'w-6 h-2 bg-gold-500' 
                                                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                                                }`}
                                                data-testid={`button-slide-dot-${index}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="relative z-10 w-full h-[350px] lg:h-[500px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6"
                                    data-testid="img-product-main"
                                />
                            )}

                            <div className="absolute -right-6 top-20 glass-premium p-4 rounded-xl border border-white/10 animate-float shadow-xl">
                                <Heart className="text-red-500 fill-red-500" size={24} />
                            </div>
                        </div>

                        {hasMultipleImages && (
                            <div className="flex gap-3 mt-4 justify-center overflow-x-auto pb-2">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleManualSelect(index)}
                                        className={`w-20 h-20 rounded-xl border-2 overflow-hidden shrink-0 transition-all duration-300 ${
                                            currentSlide === index 
                                            ? 'border-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
                                            : 'border-white/10 opacity-50 hover:opacity-80'
                                        }`}
                                        data-testid={`button-thumbnail-${index}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain bg-navy-900/50" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

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
