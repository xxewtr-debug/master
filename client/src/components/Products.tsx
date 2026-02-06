import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Product, SortOption } from '../types';
import { ShoppingCart, Star, Search, Heart, ArrowRight } from 'lucide-react';

interface ProductsProps {
    products: Product[]; // Receive products as prop
    onAddToCart: (product: Product) => void;
    onProductClick: (product: Product) => void;
    onBack: () => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
}

export const Products: React.FC<ProductsProps> = ({ 
    products,
    onAddToCart, 
    onProductClick,
    onBack,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy
}) => {
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

    const getProcessedProducts = () => {
        let result = activeCategory === 'all' 
            ? [...products] 
            : products.filter(p => p.category === activeCategory);

        switch (sortBy) {
            case 'price-asc': result.sort((a, b) => a.price - b.price); break;
            case 'price-desc': result.sort((a, b) => b.price - a.price); break;
            case 'rating': result.sort((a, b) => b.rating - a.rating); break;
        }
        return result;
    };

    const filteredProducts = getProcessedProducts();

    return (
        <section className="min-h-screen py-24 sm:py-32 relative bg-transparent">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-navy-900/50 to-transparent pointer-events-none"></div>
            <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-gold-600/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-3 sm:px-6 relative z-10">
                
                {/* 1. Top Navigation Bar with Filters */}
                <div className="w-full flex flex-col gap-4 mb-8 sm:mb-10">
                    {/* Back button and count */}
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-gold-500 hover:text-navy-950 hover:border-gold-500 transition-all duration-300 group"
                        >
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            <span className="font-bold text-xs">الرئيسية</span>
                        </button>
                        
                        <div className="text-slate-500 text-xs font-bold">
                            {filteredProducts.length} منتج
                        </div>
                    </div>

                    {/* Categories Filters - At Top */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                                    activeCategory === cat.id
                                        ? 'bg-gold-500 border-gold-500 text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>


                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
                    {filteredProducts.map((product, idx) => (
                        <div 
                            key={product.id}
                            onClick={() => onProductClick(product)}
                            onMouseEnter={() => setHoveredProduct(product.id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                            // Card Container - Made semi-transparent
                            className="group relative bg-[#0a0f1c]/80 backdrop-blur-sm rounded-[1.5rem] sm:rounded-[3rem] p-2 sm:p-4 cursor-pointer transition-all duration-700 hover:bg-[#0f1623] hover:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.7)] border border-white/5 hover:border-white/10 flex flex-col"
                            style={{ animation: `fadeIn 0.8s ease-out ${idx * 0.1}s forwards`, opacity: 0 }}
                        >
                            {/* Image Stage */}
                            <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full rounded-[1.2rem] sm:rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-[#141c2f] to-[#0a0f1c] flex items-center justify-center isolate">
                                
                                {/* 1. Soft Ambient Light */}
                                <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-white/5 to-transparent opacity-50"></div>

                                {/* 2. The Spotlight */}
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gold-500/10 rounded-full blur-[40px] sm:blur-[80px] transition-all duration-1000 ease-out ${hoveredProduct === product.id ? 'opacity-100 scale-110' : 'opacity-40 scale-90'}`}></div>

                                {/* 3. The Product Image */}
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className={`relative z-10 w-[110%] h-[110%] object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.5)] sm:drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                                        hoveredProduct === product.id 
                                        ? 'scale-110 -translate-y-4 sm:-translate-y-6 -rotate-3' 
                                        : 'scale-100 translate-y-1 sm:translate-y-2 rotate-0'
                                    }`}
                                />

                                {/* 4. Floating Overlay Content */}
                                <div className="absolute top-2 left-2 right-2 sm:top-5 sm:left-5 sm:right-5 flex justify-between items-start z-20">
                                    {product.inStock === false ? (
                                        <span className="bg-rose-500 text-white text-[8px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg shadow-rose-500/20">
                                            نفذت الكمية
                                        </span>
                                    ) : product.isNew ? (
                                        <span className="bg-gold-500 text-navy-950 text-[8px] sm:text-[10px] font-black px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg shadow-gold-500/20">
                                            NEW
                                        </span>
                                    ) : <div></div>}
                                    
                                    <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0">
                                        <Heart size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="pt-3 sm:pt-6 pb-1 sm:pb-2 px-1 sm:px-2 flex flex-col flex-grow">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-1 sm:mb-2 gap-1">
                                    <h3 className="text-white font-bold text-sm sm:text-lg leading-tight group-hover:text-gold-400 transition-colors w-full sm:w-2/3 truncate">
                                        {product.name}
                                    </h3>
                                    <div className="hidden sm:flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                        <Star size={10} className="text-gold-500 fill-gold-500" />
                                        <span className="text-xs font-bold text-slate-300">{product.rating}.0</span>
                                    </div>
                                </div>
                                
                                <p className="text-slate-500 text-[10px] sm:text-xs mb-2 sm:mb-4 line-clamp-1 opacity-80">{product.description}</p>

                                {/* Price & Cart Action */}
                                <div className="mt-auto flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between p-1 bg-[#050911]/80 rounded-xl sm:rounded-2xl border border-white/5 gap-2 sm:gap-0">
                                    <div className="px-1 sm:px-4 py-1 sm:py-2 text-center sm:text-right">
                                        <div className="flex items-baseline justify-center sm:justify-start gap-1">
                                            <span className="text-base sm:text-lg font-black text-white">{product.price.toLocaleString()}</span>
                                            <span className="text-[10px] text-gold-500">د.ع</span>
                                        </div>
                                    </div>

                                    {product.inStock !== false ? (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onProductClick(product); }}
                                            className={`h-8 sm:h-10 px-0 sm:px-6 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto ${
                                                hoveredProduct === product.id 
                                                ? 'bg-gold-500 text-navy-950 shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                                                : 'bg-white/5 text-slate-300 hover:bg-white hover:text-navy-950'
                                            }`}
                                            data-testid="button-buy-product"
                                        >
                                            <span className="sm:inline">شراء</span>
                                            <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                                        </button>
                                    ) : (
                                        <div className="h-8 sm:h-10 px-0 sm:px-6 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 w-full sm:w-auto bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            data-testid="text-sold-out"
                                        >
                                            نفذت الكمية
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};