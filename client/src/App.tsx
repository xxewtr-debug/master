import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Products } from './components/Products';
import { Features } from './components/Features';
import { Contact } from './components/Contact';
import { ProductDetails } from './components/ProductDetails';
import { Admin } from './components/Admin';
import { Logo } from './components/Logo';
import { PRODUCTS as INITIAL_PRODUCTS } from './constants';
import { Product, CartItem, Page, ToastMessage, SortOption } from './types';
import { X, Trash2, CheckCircle, ArrowUp, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const App: React.FC = () => {
    // Core State including Dynamic Products
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    
    // Products UI State
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [adminToken, setAdminToken] = useState('');

    // Scroll Management
    const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});

    // --- ADMIN URL DETECTION ---
    useEffect(() => {
        // Check if the current URL path is /admin
        // We use try-catch here as accessing location properties might be restricted in some environments,
        // though typically location.pathname is safe.
        try {
            if (window.location.pathname === '/admin') {
                setCurrentPage('admin');
            }
        } catch (e) {
            console.error("Error reading pathname:", e);
        }
    }, []);

    // --- SECURITY: Disable Right Click & Copy Shortcuts ---
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 's' || e.key === 'u' || e.key === 'p')) {
                e.preventDefault();
            }
            if (e.key === 'F12') {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // --- Browser History Handling ---
    useEffect(() => {
        try {
            if (!window.history.state) {
                window.history.replaceState({ page: 'home' }, '');
            }
        } catch (e) {
            console.warn("History state initialization failed (likely due to sandbox environment):", e);
        }

        const handlePopState = (event: PopStateEvent) => {
            if (event.state && event.state.page) {
                const targetPage = event.state.page as Page;
                if (targetPage === 'product-details' && event.state.product) {
                    setSelectedProduct(event.state.product);
                }
                setCurrentPage(targetPage);
            } else {
                setCurrentPage('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Scroll Restoration Logic
    useEffect(() => {
        if (currentPage === 'products') {
            const savedScroll = scrollPositions['products'] || 0;
            setTimeout(() => window.scrollTo({ top: savedScroll, behavior: 'instant' }), 10);
        } else if (currentPage === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentPage === 'product-details' || currentPage === 'admin') {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [currentPage]);

    // Custom Navigation
    const navigate = (page: Page, product: Product | null = null) => {
        setScrollPositions(prev => ({ ...prev, [currentPage]: window.scrollY }));
        
        // Update URL just for show (since we are SPA)
        // Wrapped in try-catch to prevent SecurityError in sandboxed environments (e.g. CodeSandbox, StackBlitz, etc.)
        try {
            const url = page === 'home' ? '/' : `/${page}`;
            window.history.pushState({ page, product }, '', url);
        } catch (e) {
            console.warn("Navigation URL update skipped due to environment restrictions:", e);
        }
        
        if (product) setSelectedProduct(product);
        setCurrentPage(page);
    };

    // Scroll To Top Button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- Cart & Toast Logic ---
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showToast(`تم إضافة ${product.name} إلى السلة`);
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = String(Date.now());
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // --- DATA FETCHING ---
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setProducts(data);
                    if (selectedProduct && currentPage === 'product-details') {
                        const stillExists = data.find((p: Product) => p.id === selectedProduct.id);
                        if (!stillExists) {
                            setSelectedProduct(null);
                            setCurrentPage('products');
                            showToast("تم حذف هذا المنتج", "error");
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        const interval = setInterval(fetchProducts, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentPage !== 'product-details' || !selectedProduct) return;
        const checkProduct = async () => {
            try {
                const res = await fetch(`/api/products/${selectedProduct.id}`);
                if (!res.ok) {
                    setSelectedProduct(null);
                    setCurrentPage('products');
                    showToast("تم حذف هذا المنتج", "error");
                    fetchProducts();
                }
            } catch {}
        };
        const interval = setInterval(checkProduct, 3000);
        return () => clearInterval(interval);
    }, [currentPage, selectedProduct]);

    const handleForceLogout = () => {
        setAdminToken('');
        navigate('home');
        showToast("تم إلغاء صلاحيتك من قبل المدير الرئيسي", "error");
    };

    // --- Admin Functions ---
    const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (adminToken) headers['X-Admin-Token'] = adminToken;
            const response = await fetch('/api/products', {
                method: 'POST',
                headers,
                body: JSON.stringify(newProductData)
            });
            if (response.status === 401) { handleForceLogout(); return; }
            if (response.ok) {
                await fetchProducts();
                showToast("تم إضافة المنتج بنجاح");
            }
        } catch (error) {
            showToast("فشل إضافة المنتج", "error");
        }
    };

    const handleUpdateProduct = async (updatedProduct: Product) => {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (adminToken) headers['X-Admin-Token'] = adminToken;
            const response = await fetch(`/api/products/${updatedProduct.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updatedProduct)
            });
            if (response.status === 401) { handleForceLogout(); return; }
            if (response.ok) {
                await fetchProducts();
                showToast("تم تحديث المنتج بنجاح");
            }
        } catch (error) {
            showToast("فشل تحديث المنتج", "error");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            const headers: Record<string, string> = {};
            if (adminToken) headers['X-Admin-Token'] = adminToken;
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers
            });
            if (response.status === 401) { handleForceLogout(); return; }
            if (response.ok) {
                await fetchProducts();
                showToast("تم حذف المنتج");
            }
        } catch (error) {
            showToast("فشل حذف المنتج", "error");
        }
    };


    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return (
                    <div className="animate-fade-in">
                        <Hero 
                            onShopNow={() => navigate('products')} 
                        />
                        <Features />
                        <Contact />
                    </div>
                );
            case 'products':
                return (
                    <div className="animate-fade-in">
                        <Products 
                            products={products}
                            onAddToCart={addToCart} 
                            onProductClick={async (p) => {
                                try {
                                    const res = await fetch(`/api/products/${p.id}`);
                                    if (res.ok) {
                                        const freshProduct = await res.json();
                                        navigate('product-details', freshProduct);
                                    } else {
                                        await fetchProducts();
                                        showToast("تم حذف هذا المنتج", "error");
                                    }
                                } catch {
                                    navigate('product-details', p);
                                }
                            }}
                            onBack={() => navigate('home')}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />
                    </div>
                );
            case 'product-details':
                return selectedProduct ? (
                    <ProductDetails 
                        product={selectedProduct}
                        onBack={() => window.history.back()}
                        onAddToCart={addToCart}
                    />
                ) : null;
            case 'admin':
                return (
                    <Admin 
                        products={products}
                        onAddProduct={handleAddProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onClose={() => navigate('home')}
                        onTokenChange={setAdminToken}
                        onForceLogout={handleForceLogout}
                    />
                );
            case 'about':
                return <div className="pt-32 text-center text-white min-h-screen flex items-center justify-center">
                    <h2 className="text-3xl font-bold">صفحة من نحن (قيد التحديث بتصميم أسطوري)</h2>
                </div>;
            case 'contact':
                return (
                    <div className="pt-24 animate-fade-in">
                        <Contact />
                    </div>
                );
            default:
                return null;
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-transparent text-white font-cairo selection:bg-gold-500 selection:text-navy-950 flex flex-col overflow-x-hidden">
            
            {/* Navbar - hidden on admin page for clean look */}
            {currentPage !== 'admin' && (
                <Navbar 
                    currentPage={currentPage} 
                    setPage={(page) => navigate(page)}
                    cart={cart}
                    toggleCart={() => setIsCartOpen(true)}
                />
            )}

            <main className="flex-grow">
                {renderPage()}
            </main>

            {/* Footer - hidden on admin page */}
            {currentPage !== 'admin' && (
                <footer className="bg-black/80 backdrop-blur-xl pt-24 pb-12 border-t border-white/5 relative overflow-hidden mt-auto">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-12 text-right">
                            
                            {/* Brand Column */}
                            <div className="md:col-span-1">
                                <div className="mb-6">
                                    <Logo className="h-14" variant="footer" />
                                </div>
                                <p className="text-slate-400 text-sm leading-8 font-medium">
                                    الوجهة الأولى للباحثين عن التميز. نقدم لك أرقى الأحذية العالمية بجودة "الماستر كواليتي" التي لا تضاهى.
                                </p>
                            </div>

                            {/* Links 1 */}
                            <div className="flex flex-col items-start">
                                <h3 className="text-white font-bold text-lg mb-6 relative pl-4">
                                    روابط سريعة
                                    <span className="absolute -bottom-2 right-0 w-8 h-1 bg-gold-500 rounded-full"></span>
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-400 w-full">
                                    <li onClick={() => navigate('home')} className="hover:text-gold-500 cursor-pointer transition-colors flex items-center gap-2 group">
                                        <ArrowLeft size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
                                        الرئيسية
                                    </li>
                                    <li onClick={() => navigate('products')} className="hover:text-gold-500 cursor-pointer transition-colors flex items-center gap-2 group">
                                        <ArrowLeft size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
                                        المنتجات
                                    </li>
                                </ul>
                            </div>

                            {/* Links 2 */}
                            <div className="flex flex-col items-start">
                                <h3 className="text-white font-bold text-lg mb-6 relative pl-4">
                                    الدعم والمساعدة
                                    <span className="absolute -bottom-2 right-0 w-8 h-1 bg-gold-500 rounded-full"></span>
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-400 w-full">
                                    <li className="hover:text-gold-500 cursor-pointer transition-colors">تتبع الطلب</li>
                                    <li className="hover:text-gold-500 cursor-pointer transition-colors">سياسة الاسترجاع</li>
                                    <li className="hover:text-gold-500 cursor-pointer transition-colors">الأسئلة الشائعة</li>
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div className="flex flex-col items-start">
                                <h3 className="text-white font-bold text-lg mb-6 relative pl-4">
                                    تواصل معنا
                                    <span className="absolute -bottom-2 right-0 w-8 h-1 bg-gold-500 rounded-full"></span>
                                </h3>
                                <ul className="space-y-4 text-sm text-slate-400">
                                    <li className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold-500">📍</span>
                                        العراق، بابل المسيب شارع الحسينيه
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold-500">📞</span>
                                        <span className="dir-ltr">0771 196 3103</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-slate-600 text-xs gap-4">
                            <p>&copy; 2024 مرتضى دبي. جميع الحقوق محفوظة.</p>
                            <div className="flex gap-4 opacity-50">
                                <span>الشروط والأحكام</span>
                                <span>سياسة الخصوصية</span>
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            {/* Cart Sidebar */}
            {isCartOpen && (
                <>
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" onClick={() => setIsCartOpen(false)}></div>
                    <div className="fixed top-0 left-0 h-full w-full max-w-md bg-[#0f172a] border-r border-white/10 z-[70] shadow-2xl animate-slide-in-right flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <ShoppingCart className="text-gold-500" size={22} /> حقيبة التسوق
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 transition-all"><X size={16} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                                    <ShoppingCart size={48} className="opacity-20" />
                                    <p>السلة فارغة حالياً</p>
                                    <button onClick={() => setIsCartOpen(false)} className="text-gold-500 text-sm font-bold hover:underline">ابدأ التسوق</button>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-gold-500/30 transition-colors">
                                        <div className="w-20 h-20 rounded-xl bg-white/5 p-2 flex items-center justify-center">
                                            <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-white mb-1">{item.name}</h4>
                                            <p className="text-gold-500 text-sm font-bold mb-2">{item.price.toLocaleString()} د.ع</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 bg-black/20 w-fit px-2 py-1 rounded-lg">
                                                <span>الكمية: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 border-t border-white/10 bg-[#020617]">
                                <div className="flex justify-between mb-6 text-white">
                                    <span className="text-slate-400">الإجمالي النهائي:</span>
                                    <span className="text-xl font-black text-gold-500">{cartTotal.toLocaleString()} د.ع</span>
                                </div>
                                <button className="w-full py-4 bg-gold-500 text-navy-950 font-black rounded-xl hover:bg-gold-400 transition-all shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]">
                                    تأكيد الطلب
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Scroll Top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-8 right-8 w-14 h-14 bg-gold-500 text-navy-900 rounded-full shadow-lg shadow-gold-500/20 flex items-center justify-center transition-all duration-500 z-50 hover:scale-110 hover:-translate-y-1 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            >
                <ArrowUp size={24} strokeWidth={3} />
            </button>

            {/* Toasts */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] space-y-3 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="bg-navy-800/90 backdrop-blur-md text-white border border-gold-500/30 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up min-w-[300px] justify-center">
                        <CheckCircle size={20} className="text-gold-500" />
                        <span className="text-sm font-bold">{toast.text}</span>
                    </div>
                ))}
            </div>
            <Toaster />
        </div>
    );
};

export default App;