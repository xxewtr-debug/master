import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { Page, CartItem } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
    currentPage: Page;
    setPage: (page: Page) => void;
    cart: CartItem[];
    toggleCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage, cart, toggleCart }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
            isScrolled 
            ? 'bg-[#020617]/80 backdrop-blur-xl border-white/5 py-3 shadow-2xl' 
            : 'bg-gradient-to-b from-[#020617]/90 to-transparent border-transparent py-6'
        }`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                
                {/* Logo - New Design */}
                <div onClick={() => setPage('home')} className="cursor-pointer group hover:opacity-90 transition-opacity">
                    <Logo className="h-10 sm:h-12" />
                </div>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md shadow-xl">
                    {[
                        { id: 'home', label: 'الرئيسية' },
                        { id: 'products', label: 'المنتجات' },
                        { id: 'about', label: 'من نحن' },
                        { id: 'contact', label: 'تواصل معنا' }
                    ].map(link => (
                        <button
                            key={link.id}
                            onClick={() => setPage(link.id as Page)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden group ${
                                currentPage === link.id 
                                ? 'text-navy-950 bg-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <span className="relative z-10">{link.label}</span>
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 sm:gap-5">
                    <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:scale-110 transition-all"><Search size={22} /></button>
                    
                    <button 
                        onClick={toggleCart}
                        className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-gold-500 hover:text-navy-900 hover:border-gold-500 transition-all duration-300 group shadow-lg"
                    >
                        <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-red-600 text-white text-[10px] sm:text-[11px] font-bold rounded-full flex items-center justify-center border-[3px] border-[#020617] shadow-md transform group-hover:scale-110 transition-transform">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};