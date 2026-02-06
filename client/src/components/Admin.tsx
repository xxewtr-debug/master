import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { 
    Lock, Plus, Trash2, Image as ImageIcon, LayoutGrid, DollarSign, 
    FileText, CheckCircle, Package, LogOut, Search, 
    ChevronLeft, Shield, Key, UserCircle,
    XCircle, Loader2, Edit, X, Eye, EyeOff, TrendingUp, Hash, Copy, ShieldCheck
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Logo } from './Logo';

interface AdminCode {
    id: number;
    code: string;
    label: string;
    isMaster: boolean;
    createdAt: string;
}

interface AdminProps {
    products: Product[];
    onAddProduct: (product: Product) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
    onClose: () => void;
    adminToken?: string;
    onTokenChange?: (token: string) => void;
    onForceLogout?: () => void;
}

type AdminTab = 'inventory' | 'add-product' | 'account';

export const Admin: React.FC<AdminProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onClose, onTokenChange, onForceLogout }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMaster, setIsMaster] = useState(false);
    const [adminLabel, setAdminLabel] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' }));
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editProduct, setEditProduct] = useState<Partial<Product>>({});
    const [editSizeInput, setEditSizeInput] = useState('');
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string>('');
    const [editAdditionalImageFiles, setEditAdditionalImageFiles] = useState<File[]>([]);
    const [editAdditionalPreviews, setEditAdditionalPreviews] = useState<string[]>([]);
    const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
    const [editUploading, setEditUploading] = useState(false);

    const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: 'men', rating: 5, isNew: true, sizes: [] });
    const [newSizeInput, setNewSizeInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const [adminCodes, setAdminCodes] = useState<AdminCode[]>([]);
    const [newCodeLabel, setNewCodeLabel] = useState('');
    const [newCodeValue, setNewCodeValue] = useState('');
    const [addingCode, setAddingCode] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [codeSuccess, setCodeSuccess] = useState('');
    const [deleteCodeConfirm, setDeleteCodeConfirm] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [adminToken, setAdminToken] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' }));
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const handleSessionRevoked = () => {
        setIsAuthenticated(false);
        setAdminToken('');
        setIsMaster(false);
        setAdminLabel('');
        setPassword('');
        onTokenChange?.('');
        onForceLogout?.();
    };

    const checkRevoked = (res: Response): boolean => {
        if (res.status === 401) {
            handleSessionRevoked();
            return true;
        }
        return false;
    };

    const fetchAdminCodes = async () => {
        if (!adminToken) return;
        try {
            const res = await fetch('/api/admin/codes', {
                headers: { 'X-Admin-Token': adminToken }
            });
            if (checkRevoked(res)) return;
            if (res.ok) {
                const codes = await res.json();
                setAdminCodes(codes);
            }
        } catch (err) {}
    };

    useEffect(() => {
        if (isAuthenticated && isMaster && adminToken) fetchAdminCodes();
    }, [isAuthenticated, isMaster, activeTab, adminToken]);

    const totalProducts = products.length;
    const inStockCount = products.filter(p => p.inStock !== false).length;
    const outOfStockCount = products.filter(p => p.inStock === false).length;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoginLoading(true);
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: password })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'رمز الدخول غير صحيح');
                return;
            }
            const data = await res.json();
            if (data.success && data.token) {
                setAdminToken(data.token);
                setIsMaster(data.isMaster);
                setAdminLabel(data.label);
                setIsAuthenticated(true);
                onTokenChange?.(data.token);
            } else {
                setError('رمز الدخول غير صحيح');
            }
        } catch (err) {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleAddCode = async () => {
        if (!newCodeLabel.trim() || !newCodeValue.trim()) {
            setCodeError('الرجاء إدخال الاسم والرمز');
            return;
        }
        setAddingCode(true);
        setCodeError('');
        setCodeSuccess('');
        try {
            const res = await fetch('/api/admin/codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
                body: JSON.stringify({ code: newCodeValue.trim(), label: newCodeLabel.trim() })
            });
            if (checkRevoked(res)) return;
            const data = await res.json();
            if (res.ok) {
                setNewCodeLabel('');
                setNewCodeValue('');
                setCodeSuccess('تم إضافة الرمز بنجاح');
                fetchAdminCodes();
                setTimeout(() => setCodeSuccess(''), 3000);
            } else {
                setCodeError(data.error || 'حدث خطأ');
            }
        } catch (err) {
            setCodeError('حدث خطأ في الاتصال');
        } finally {
            setAddingCode(false);
        }
    };

    const handleDeleteCode = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/codes/${id}`, { method: 'DELETE', headers: { 'X-Admin-Token': adminToken } });
            if (checkRevoked(res)) return;
            if (res.ok) {
                fetchAdminCodes();
                setDeleteCodeConfirm(null);
            } else {
                const data = await res.json();
                alert(data.error || 'حدث خطأ');
            }
        } catch (err) {
            alert('حدث خطأ في الاتصال');
        }
    };

    const copyCode = (code: string, id: number) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const addSize = () => {
        const size = parseInt(newSizeInput);
        if (!isNaN(size) && size > 0 && !newProduct.sizes?.includes(size)) {
            setNewProduct(prev => ({ ...prev, sizes: [...(prev.sizes || []), size].sort((a, b) => a - b) }));
            setNewSizeInput('');
        }
    };

    const removeSize = (size: number) => {
        setNewProduct(prev => ({ ...prev, sizes: (prev.sizes || []).filter(s => s !== size) }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setAdditionalImageFiles(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdditionalImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removeAdditionalImage = (index: number) => {
        setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
        setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price || !imageFile) {
            alert('الرجاء إكمال البيانات الأساسية (الاسم، السعر، والصورة)');
            return;
        }
        if (!newProduct.sizes?.length) {
            alert('الرجاء إضافة مقاس واحد على الأقل');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!uploadRes.ok) throw new Error('فشل رفع الصورة');
            const { url } = await uploadRes.json();

            let additionalUrls: string[] = [];
            if (additionalImageFiles.length > 0) {
                const multiFormData = new FormData();
                additionalImageFiles.forEach(file => multiFormData.append('images', file));
                const multiRes = await fetch('/api/upload-multiple', { method: 'POST', body: multiFormData });
                if (multiRes.ok) {
                    const data = await multiRes.json();
                    additionalUrls = data.urls;
                }
            }

            const product: Product = {
                id: Date.now(), name: newProduct.name!, price: Number(newProduct.price),
                image: url, images: additionalUrls.length > 0 ? additionalUrls : null,
                category: newProduct.category as any || 'men',
                description: newProduct.description || 'إصدار حصري بجودة الماستر.',
                rating: 5, isNew: true, sizes: newProduct.sizes
            };
            onAddProduct(product);
            setNewProduct({ category: 'men', rating: 5, isNew: true, name: '', price: 0, image: '', description: '', sizes: [] });
            setImageFile(null);
            setImagePreview('');
            setAdditionalImageFiles([]);
            setAdditionalImagePreviews([]);
            setActiveTab('inventory');
        } catch (err) {
            alert('حدث خطأ أثناء رفع المنتج');
        } finally {
            setUploading(false);
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setEditProduct({ ...product });
        setEditImagePreview(product.image);
        setEditImageFile(null);
        setEditSizeInput('');
        setEditExistingImages(product.images || []);
        setEditAdditionalImageFiles([]);
        setEditAdditionalPreviews([]);
    };

    const closeEditModal = () => {
        setEditingProduct(null);
        setEditProduct({});
        setEditImagePreview('');
        setEditImageFile(null);
        setEditSizeInput('');
        setEditExistingImages([]);
        setEditAdditionalImageFiles([]);
        setEditAdditionalPreviews([]);
    };

    const addEditSize = () => {
        const size = parseInt(editSizeInput);
        if (!isNaN(size) && size > 0 && !editProduct.sizes?.includes(size)) {
            setEditProduct(prev => ({ ...prev, sizes: [...(prev.sizes || []), size].sort((a, b) => a - b) }));
            setEditSizeInput('');
        }
    };

    const removeEditSize = (size: number) => {
        setEditProduct(prev => ({ ...prev, sizes: (prev.sizes || []).filter(s => s !== size) }));
    };

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setEditImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleEditAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setEditAdditionalImageFiles(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAdditionalPreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removeEditExistingImage = (index: number) => {
        setEditExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeEditAdditionalImage = (index: number) => {
        setEditAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
        setEditAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        if (!editProduct.name || !editProduct.price) {
            alert('الرجاء إكمال البيانات الأساسية (الاسم والسعر)');
            return;
        }
        setEditUploading(true);
        try {
            let imageUrl = editProduct.image;
            if (editImageFile) {
                const formData = new FormData();
                formData.append('image', editImageFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!uploadRes.ok) throw new Error('فشل رفع الصورة');
                const { url } = await uploadRes.json();
                imageUrl = url;
            }

            let newAdditionalUrls: string[] = [];
            if (editAdditionalImageFiles.length > 0) {
                const multiFormData = new FormData();
                editAdditionalImageFiles.forEach(file => multiFormData.append('images', file));
                const multiRes = await fetch('/api/upload-multiple', { method: 'POST', body: multiFormData });
                if (multiRes.ok) {
                    const data = await multiRes.json();
                    newAdditionalUrls = data.urls;
                }
            }

            const allImages = [...editExistingImages, ...newAdditionalUrls];

            const updatedProduct: Product = {
                ...editingProduct,
                name: editProduct.name!, price: Number(editProduct.price),
                image: imageUrl!, images: allImages.length > 0 ? allImages : null,
                category: editProduct.category as any || editingProduct.category,
                description: editProduct.description || editingProduct.description,
                sizes: editProduct.sizes || editingProduct.sizes
            };
            onUpdateProduct(updatedProduct);
            closeEditModal();
        } catch (err) {
            alert('حدث خطأ أثناء تحديث المنتج');
        } finally {
            setEditUploading(false);
        }
    };

    const getTabLabel = () => {
        switch(activeTab) {
            case 'inventory': return 'المخزون';
            case 'add-product': return 'إضافة منتج';
            case 'account': return 'حسابي';
            default: return '';
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
                 <div className="w-full max-w-[380px] bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative z-10 animate-fade-in-up text-center">
                    <div className="mb-8 flex justify-center transform scale-90"><Logo /></div>
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-white font-cinzel tracking-widest mb-1">لوحة التحكم</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">مصادقة الدخول</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none text-center text-lg tracking-[0.3em] transition-all placeholder:text-slate-700 font-bold"
                                placeholder="••••••"
                                data-testid="input-admin-password" />
                            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-gold-500 transition-colors" />
                        </div>
                        {error && <div className="text-rose-400 text-[10px] font-bold bg-rose-500/10 py-2 rounded-lg border border-rose-500/10 flex items-center justify-center gap-2"><Shield size={10}/>{error}</div>}
                        <button type="submit" disabled={loginLoading}
                            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 font-black py-3 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-[0.98] tracking-widest text-xs uppercase disabled:opacity-50 flex items-center justify-center gap-2"
                            data-testid="button-admin-login">
                            {loginLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                            دخول
                        </button>
                    </form>
                    <button onClick={onClose} className="mt-6 text-slate-500 text-[10px] font-bold hover:text-white transition-colors border-b border-transparent hover:border-slate-500 pb-0.5">العودة للمتجر</button>
                 </div>
            </div>
        );
    }

    const sidebarItems = [
        { id: 'inventory' as AdminTab, label: 'المخزون', icon: Package, count: totalProducts },
        { id: 'add-product' as AdminTab, label: 'إضافة منتج', icon: Plus, count: null },
        ...(isMaster ? [{ id: 'account' as AdminTab, label: 'حسابي', icon: UserCircle, count: null }] : []),
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-right font-cairo flex overflow-hidden selection:bg-gold-500 selection:text-navy-900" dir="rtl">
            
            {/* SIDEBAR */}
            <aside className="w-20 lg:w-[260px] bg-[#0a0f1c]/95 backdrop-blur-xl border-l border-white/5 flex flex-col z-30 shadow-2xl transition-all duration-300">
                <div className="h-20 flex items-center justify-center lg:justify-start px-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent gap-4">
                    <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center text-navy-950 shadow-[0_0_15px_rgba(212,175,55,0.4)] shrink-0">
                        <Lock size={20} strokeWidth={2.5} />
                    </div>
                    <div className="hidden lg:flex flex-col">
                        <h1 className="font-black text-white font-cinzel tracking-wider text-sm">لوحة التحكم</h1>
                        <p className="text-[9px] text-gold-500 font-bold tracking-[0.15em]">ادارة المتجر</p>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 lg:px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="hidden lg:block text-[9px] text-slate-600 font-bold uppercase tracking-widest px-2 mb-4">القائمة</p>
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-center lg:justify-start px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                                activeTab === item.id 
                                ? 'bg-gold-500/10 border border-gold-500/20 text-white' 
                                : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'
                            }`}
                            data-testid={`button-tab-${item.id}`}
                        >
                            {activeTab === item.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-1 bg-gold-500 rounded-l-full shadow-[0_0_8px_#d4af37]"></div>}
                            <div className="flex items-center gap-3 relative z-10 w-full">
                                <item.icon size={18} className={activeTab === item.id ? "text-gold-500" : ""} />
                                <span className="hidden lg:block font-bold text-sm">{item.label}</span>
                                {item.count !== null && (
                                    <span className={`mr-auto hidden lg:flex w-6 h-6 items-center justify-center rounded-lg text-[10px] font-black ${activeTab === item.id ? 'bg-gold-500/20 text-gold-400' : 'bg-white/5 text-slate-500'}`}>
                                        {item.count}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </nav>

                {/* Admin Info + Logout */}
                <div className="p-3 lg:p-4 border-t border-white/5 space-y-2">
                    <div className="hidden lg:flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                            {isMaster ? <ShieldCheck size={14} className="text-gold-500" /> : <Key size={14} className="text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-xs font-bold truncate">{adminLabel}</p>
                            <p className="text-[9px] text-slate-500">{isMaster ? 'مدير رئيسي' : 'مشرف'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full flex items-center justify-center lg:justify-start gap-3 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent px-3 py-2.5 rounded-xl transition-all font-bold text-sm">
                        <LogOut size={18} />
                        <span className="hidden lg:inline">خروج</span>
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 relative flex flex-col h-screen overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

                {/* Header */}
                <header className="px-6 lg:px-10 py-4 flex justify-between items-center z-20 border-b border-white/5 bg-[#020617]/50 backdrop-blur-md">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 text-[10px] mb-0.5 font-bold">
                            <span>لوحة التحكم</span>
                            <ChevronLeft size={10} />
                            <span className="text-gold-500">{getTabLabel()}</span>
                        </div>
                        <h2 className="text-base lg:text-lg font-black text-white">
                             مرحباً، {adminLabel}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <p className="text-gold-500 font-bold font-mono text-xs tracking-widest">{currentTime}</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative z-10">
                    
                    {/* INVENTORY TAB */}
                    {activeTab === 'inventory' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="grid grid-cols-3 gap-3 lg:gap-4">
                                <div className="bg-[#0a0f1c] border border-white/5 rounded-xl p-4 lg:p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Package size={16} className="text-blue-400" />
                                        </div>
                                        <Hash size={12} className="text-slate-600" />
                                    </div>
                                    <p className="text-xl lg:text-2xl font-black text-white">{totalProducts}</p>
                                    <p className="text-[10px] lg:text-xs text-slate-500 font-bold mt-1">إجمالي المنتجات</p>
                                </div>
                                <div className="bg-[#0a0f1c] border border-white/5 rounded-xl p-4 lg:p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <Eye size={16} className="text-emerald-400" />
                                        </div>
                                        <TrendingUp size={12} className="text-emerald-500" />
                                    </div>
                                    <p className="text-xl lg:text-2xl font-black text-emerald-400">{inStockCount}</p>
                                    <p className="text-[10px] lg:text-xs text-slate-500 font-bold mt-1">متوفر</p>
                                </div>
                                <div className="bg-[#0a0f1c] border border-white/5 rounded-xl p-4 lg:p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                            <EyeOff size={16} className="text-rose-400" />
                                        </div>
                                        <XCircle size={12} className="text-rose-500" />
                                    </div>
                                    <p className="text-xl lg:text-2xl font-black text-rose-400">{outOfStockCount}</p>
                                    <p className="text-[10px] lg:text-xs text-slate-500 font-bold mt-1">نفذت الكمية</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                <div className="relative flex-1 group">
                                    <input type="text" placeholder="بحث عن منتج..." 
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#0a0f1c] border border-white/5 rounded-xl px-11 py-3 text-sm focus:border-gold-500/50 outline-none transition-all text-white placeholder:text-slate-600"
                                        data-testid="input-search" />
                                    <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-gold-500 transition-colors" />
                                </div>
                                <button onClick={() => setActiveTab('add-product')} className="bg-gold-500 text-navy-950 px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20 active:scale-95 whitespace-nowrap"
                                    data-testid="button-new-product">
                                    <Plus size={16} strokeWidth={3} />
                                    منتج جديد
                                </button>
                            </div>

                            <div className="bg-[#0a0f1c] border border-white/5 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-right border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-white/[0.03] text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                                                <th className="px-5 py-4 text-right">المنتج</th>
                                                <th className="px-5 py-4 text-right">التصنيف</th>
                                                <th className="px-5 py-4 text-right">السعر</th>
                                                <th className="px-5 py-4 text-right">المقاسات</th>
                                                <th className="px-5 py-4 text-center">الحالة</th>
                                                <th className="px-5 py-4 text-center">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {products.filter(p => p.name.includes(searchTerm)).length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-5 py-16 text-center">
                                                        <Package size={40} className="text-slate-700 mx-auto mb-3" />
                                                        <p className="text-slate-500 text-sm font-bold">لا توجد منتجات</p>
                                                        <p className="text-slate-600 text-xs mt-1">اضغط "منتج جديد" لإضافة أول منتج</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.filter(p => p.name.includes(searchTerm)).map(product => (
                                                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-lg bg-[#020617] p-1 border border-white/5 group-hover:border-gold-500/20 transition-colors overflow-hidden shrink-0">
                                                                    <img src={product.image} className="w-full h-full object-contain" alt="" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-white font-bold text-sm truncate">{product.name}</p>
                                                                    <p className="text-[9px] text-slate-600 font-mono">#{product.id}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px] font-bold border border-white/5">
                                                                {CATEGORIES.find(c => c.id === product.category)?.label || product.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className="font-mono font-black text-gold-500 text-sm">{product.price.toLocaleString()}</span>
                                                            <span className="text-[9px] text-slate-600 mr-1">د.ع</span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex flex-wrap gap-1">
                                                                {product.sizes?.slice(0, 4).map(s => (
                                                                    <span key={s} className="w-7 h-7 rounded-md bg-white/5 border border-white/5 flex items-center justify-center text-[9px] font-bold text-slate-400">{s}</span>
                                                                ))}
                                                                {product.sizes && product.sizes.length > 4 && (
                                                                    <span className="w-7 h-7 rounded-md bg-white/5 border border-white/5 flex items-center justify-center text-[9px] font-bold text-slate-500">+{product.sizes.length - 4}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    const updated = { ...product, inStock: !product.inStock };
                                                                    onUpdateProduct(updated);
                                                                }}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all ${
                                                                    product.inStock !== false
                                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                                                }`}
                                                                data-testid="button-toggle-stock"
                                                            >
                                                                {product.inStock !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                                                                {product.inStock !== false ? 'متوفر' : 'نفذت'}
                                                            </button>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button onClick={() => openEditModal(product)}
                                                                    className="w-9 h-9 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center hover:bg-gold-500 hover:text-navy-950 transition-all"
                                                                    data-testid="button-edit-product" title="تعديل">
                                                                    <Edit size={14} />
                                                                </button>
                                                                {deleteConfirm === product.id ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <button onClick={() => { onDeleteProduct(product.id); setDeleteConfirm(null); }}
                                                                            className="h-9 px-2 rounded-lg bg-rose-500 text-white text-[10px] font-black flex items-center justify-center gap-1 transition-all">
                                                                            <Trash2 size={12} /> تأكيد
                                                                        </button>
                                                                        <button onClick={() => setDeleteConfirm(null)}
                                                                            className="w-9 h-9 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 transition-all">
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button onClick={() => setDeleteConfirm(product.id)}
                                                                        className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                                                        data-testid="button-delete-product" title="حذف">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ADD PRODUCT TAB */}
                    {activeTab === 'add-product' && (
                        <div className="animate-fade-in max-w-3xl mx-auto">
                            <div className="bg-[#0a0f1c] border border-white/5 rounded-2xl p-6 lg:p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="w-11 h-11 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 border border-gold-500/20">
                                        <Plus size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">إضافة منتج جديد</h3>
                                        <p className="text-[10px] text-slate-500 font-bold">أضف قطعة جديدة للمتجر</p>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <FileText size={10} className="text-gold-500" /> اسم المنتج
                                            </label>
                                            <input type="text" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-gold-500/50 outline-none transition-all placeholder:text-slate-700" 
                                                placeholder="مثلاً: ييزي بوست 350" value={newProduct.name || ''}
                                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} data-testid="input-product-name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <DollarSign size={10} className="text-gold-500" /> السعر (د.ع)
                                            </label>
                                            <input type="number" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-gold-500/50 outline-none transition-all font-mono" 
                                                placeholder="0" value={newProduct.price || ''}
                                                onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} data-testid="input-product-price" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <LayoutGrid size={10} className="text-gold-500" /> التصنيف
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                                    <button key={cat.id} type="button" onClick={() => setNewProduct({...newProduct, category: cat.id as any})}
                                                        className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${newProduct.category === cat.id ? 'bg-gold-500 border-gold-500 text-navy-950' : 'bg-[#020617] border-white/5 text-slate-500 hover:border-white/20'}`}
                                                        data-testid={`button-category-${cat.id}`}>
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon size={10} className="text-gold-500" /> الصورة الرئيسية
                                            </label>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="product-image" data-testid="input-product-image" />
                                            <label htmlFor="product-image"
                                                className="w-full bg-[#020617] border border-dashed border-white/10 rounded-xl px-4 py-3.5 text-xs cursor-pointer flex items-center justify-center gap-3 hover:border-gold-500/50 transition-colors h-[88px]">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="معاينة" className="w-14 h-14 object-contain rounded-lg" />
                                                ) : (
                                                    <><Plus size={16} className="text-gold-500" /><span className="text-slate-500">اختر صورة</span></>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon size={10} className="text-gold-500" /> صور إضافية (اختياري)
                                        </label>
                                        <input type="file" accept="image/*" multiple onChange={handleAdditionalImages} className="hidden" id="additional-images" data-testid="input-additional-images" />
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {additionalImagePreviews.map((preview, index) => (
                                                <div key={index} className="w-16 h-16 rounded-xl bg-[#020617] border border-white/10 overflow-hidden relative group shrink-0">
                                                    <img src={preview} className="w-full h-full object-contain" alt="" />
                                                    <button type="button" onClick={() => removeAdditionalImage(index)}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                        data-testid={`button-remove-additional-${index}`}>
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label htmlFor="additional-images"
                                                className="w-16 h-16 bg-[#020617] border border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-gold-500/50 transition-colors shrink-0">
                                                <Plus size={18} className="text-slate-500" />
                                            </label>
                                        </div>
                                        <p className="text-[9px] text-slate-600">هذه الصور ستظهر كعرض شرائح في صفحة تفاصيل المنتج</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المقاسات المتوفرة</label>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {newProduct.sizes?.map(size => (
                                                <div key={size} className="w-11 h-11 rounded-lg border bg-gold-500 text-navy-950 border-gold-500 text-xs font-black flex items-center justify-center relative group">
                                                    {size}
                                                    <button type="button" onClick={() => removeSize(size)}
                                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        data-testid={`button-remove-size-${size}`}>
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-1.5">
                                                <input type="number" value={newSizeInput} onChange={(e) => setNewSizeInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                                                    placeholder="40" className="w-14 h-11 bg-[#020617] border border-white/10 rounded-lg text-center text-white text-xs font-black focus:border-gold-500 outline-none"
                                                    data-testid="input-new-size" />
                                                <button type="button" onClick={addSize}
                                                    className="w-11 h-11 rounded-lg border border-gold-500/50 bg-gold-500/10 text-gold-500 flex items-center justify-center hover:bg-gold-500 hover:text-navy-950 transition-all"
                                                    data-testid="button-add-size">
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">وصف المنتج</label>
                                        <textarea rows={3} className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                                            placeholder="اكتب تفاصيل المنتج هنا..." value={newProduct.description || ''}
                                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} data-testid="input-product-description"></textarea>
                                    </div>
                                    <button type="submit" disabled={uploading}
                                        className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        data-testid="button-submit-product">
                                        {uploading ? (<><Loader2 size={20} className="animate-spin" /> جاري الرفع...</>) : (<><CheckCircle size={20} /> اعتماد وإضافة للمتجر</>)}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ACCOUNT TAB - Only for Master Admin */}
                    {activeTab === 'account' && isMaster && (
                        <div className="animate-fade-in max-w-3xl mx-auto space-y-6">

                            {/* Admin Info Card */}
                            <div className="bg-[#0a0f1c] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center border border-gold-500/20">
                                        <ShieldCheck size={28} className="text-gold-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">{adminLabel}</h3>
                                        <p className="text-xs text-gold-500 font-bold">مدير رئيسي</p>
                                    </div>
                                </div>
                                <div className="bg-[#020617] rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold mb-1">صلاحيات الحساب</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">إدارة المنتجات</span>
                                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">إضافة مشرفين</span>
                                        <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">حذف مشرفين</span>
                                        <span className="px-3 py-1 rounded-lg bg-gold-500/10 text-gold-400 text-[10px] font-bold border border-gold-500/20">حساب رئيسي</span>
                                    </div>
                                </div>
                            </div>

                            {/* Add New Admin Code */}
                            <div className="bg-[#0a0f1c] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                        <Plus size={20} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white">إضافة رمز أدمن جديد</h3>
                                        <p className="text-[10px] text-slate-500 font-bold">أنشئ رمز دخول لمشرف جديد</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">اسم المشرف</label>
                                            <input type="text" value={newCodeLabel} onChange={(e) => { setNewCodeLabel(e.target.value); setCodeError(''); }}
                                                placeholder="مثلاً: أحمد - مشرف المبيعات"
                                                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500/50 outline-none transition-all placeholder:text-slate-700"
                                                data-testid="input-code-label" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رمز الدخول</label>
                                            <input type="text" value={newCodeValue} onChange={(e) => { setNewCodeValue(e.target.value); setCodeError(''); }}
                                                placeholder="أدخل رمز فريد"
                                                className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500/50 outline-none transition-all placeholder:text-slate-700 font-mono tracking-wider"
                                                data-testid="input-code-value" />
                                        </div>
                                    </div>

                                    {codeError && (
                                        <div className="text-rose-400 text-[10px] font-bold bg-rose-500/10 py-2.5 px-4 rounded-lg border border-rose-500/10 flex items-center gap-2">
                                            <XCircle size={12} />{codeError}
                                        </div>
                                    )}
                                    {codeSuccess && (
                                        <div className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 py-2.5 px-4 rounded-lg border border-emerald-500/10 flex items-center gap-2">
                                            <CheckCircle size={12} />{codeSuccess}
                                        </div>
                                    )}

                                    <button onClick={handleAddCode} disabled={addingCode}
                                        className="w-full py-3.5 bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                                        data-testid="button-add-code">
                                        {addingCode ? (<><Loader2 size={16} className="animate-spin" /> جاري الإضافة...</>) : (<><Key size={16} /> إضافة رمز جديد</>)}
                                    </button>
                                </div>
                            </div>

                            {/* Admin Codes List */}
                            <div className="bg-[#0a0f1c] border border-white/5 rounded-2xl p-6 lg:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20">
                                        <Key size={20} className="text-gold-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white">رموز الأدمن</h3>
                                        <p className="text-[10px] text-slate-500 font-bold">جميع رموز الدخول المسجلة ({adminCodes.length})</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {adminCodes.length === 0 ? (
                                        <div className="text-center py-10">
                                            <Key size={36} className="text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-500 text-sm font-bold">لا توجد رموز بعد</p>
                                        </div>
                                    ) : (
                                        adminCodes.map(ac => (
                                            <div key={ac.id} className={`bg-[#020617] rounded-xl p-4 border transition-all ${ac.isMaster ? 'border-gold-500/20' : 'border-white/5'}`}>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${ac.isMaster ? 'bg-gold-500/10' : 'bg-white/5'}`}>
                                                            {ac.isMaster ? <ShieldCheck size={18} className="text-gold-500" /> : <Key size={18} className="text-slate-400" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-white font-bold text-sm">{ac.label}</p>
                                                                {ac.isMaster && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-gold-500/10 text-gold-400 text-[8px] font-black border border-gold-500/20">رئيسي</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="font-mono text-[11px] text-slate-400 tracking-wider">{ac.code}</span>
                                                                <button onClick={() => copyCode(ac.code, ac.id)}
                                                                    className="text-slate-600 hover:text-gold-500 transition-colors"
                                                                    data-testid={`button-copy-code-${ac.id}`}
                                                                    title="نسخ الرمز">
                                                                    {copiedId === ac.id ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0">
                                                        {ac.isMaster ? (
                                                            <span className="px-3 py-1.5 rounded-lg bg-gold-500/10 text-gold-400 text-[10px] font-black border border-gold-500/20">محمي</span>
                                                        ) : deleteCodeConfirm === ac.id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <button onClick={() => handleDeleteCode(ac.id)}
                                                                    className="h-8 px-3 rounded-lg bg-rose-500 text-white text-[10px] font-black flex items-center justify-center gap-1 transition-all"
                                                                    data-testid={`button-confirm-delete-code-${ac.id}`}>
                                                                    <Trash2 size={11} /> حذف
                                                                </button>
                                                                <button onClick={() => setDeleteCodeConfirm(null)}
                                                                    className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 transition-all">
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setDeleteCodeConfirm(ac.id)}
                                                                className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                                                data-testid={`button-delete-code-${ac.id}`}
                                                                title="حذف الرمز">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* EDIT MODAL */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeEditModal}>
                    <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative animate-fade-in"
                        onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeEditModal}
                            className="absolute top-4 left-4 w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <X size={18} />
                        </button>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 border border-gold-500/20">
                                <Edit size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">تعديل المنتج</h3>
                                <p className="text-[10px] text-slate-500 font-bold">#{editingProduct.id}</p>
                            </div>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">اسم المنتج</label>
                                    <input type="text" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500/50 outline-none transition-all"
                                        value={editProduct.name || ''} onChange={(e) => setEditProduct({...editProduct, name: e.target.value})} data-testid="input-edit-name" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">السعر (د.ع)</label>
                                    <input type="number" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500/50 outline-none transition-all font-mono"
                                        value={editProduct.price || ''} onChange={(e) => setEditProduct({...editProduct, price: Number(e.target.value)})} data-testid="input-edit-price" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">التصنيف</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                        <button key={cat.id} type="button" onClick={() => setEditProduct({...editProduct, category: cat.id})}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${editProduct.category === cat.id ? 'bg-gold-500 border-gold-500 text-navy-950' : 'bg-[#020617] border-white/5 text-slate-500 hover:border-white/20'}`}>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الصورة الرئيسية</label>
                                <div className="flex items-center gap-3">
                                    {editImagePreview && (
                                        <div className="w-16 h-16 rounded-xl bg-[#020617] border border-white/10 overflow-hidden shrink-0">
                                            <img src={editImagePreview} className="w-full h-full object-contain" alt="" />
                                        </div>
                                    )}
                                    <label className="flex-1 h-16 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-gold-500/50 transition-colors bg-[#020617]">
                                        <input type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" data-testid="input-edit-image" />
                                        <ImageIcon size={16} className="text-gold-500" />
                                        <span className="text-slate-400 text-xs">تغيير الصورة</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">صور إضافية</label>
                                <input type="file" accept="image/*" multiple onChange={handleEditAdditionalImages} className="hidden" id="edit-additional-images" data-testid="input-edit-additional-images" />
                                <div className="flex flex-wrap gap-2 items-center">
                                    {editExistingImages.map((img, index) => (
                                        <div key={`existing-${index}`} className="w-14 h-14 rounded-lg bg-[#020617] border border-white/10 overflow-hidden relative group shrink-0">
                                            <img src={img} className="w-full h-full object-contain" alt="" />
                                            <button type="button" onClick={() => removeEditExistingImage(index)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                data-testid={`button-remove-edit-existing-${index}`}>
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {editAdditionalPreviews.map((preview, index) => (
                                        <div key={`new-${index}`} className="w-14 h-14 rounded-lg bg-[#020617] border border-emerald-500/20 overflow-hidden relative group shrink-0">
                                            <img src={preview} className="w-full h-full object-contain" alt="" />
                                            <button type="button" onClick={() => removeEditAdditionalImage(index)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    <label htmlFor="edit-additional-images"
                                        className="w-14 h-14 bg-[#020617] border border-dashed border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:border-gold-500/50 transition-colors shrink-0">
                                        <Plus size={16} className="text-slate-500" />
                                    </label>
                                </div>
                                <p className="text-[9px] text-slate-600">تظهر كعرض شرائح في تفاصيل المنتج</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المقاسات</label>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {editProduct.sizes?.map(size => (
                                        <div key={size} className="w-10 h-10 rounded-lg border bg-gold-500 text-navy-950 border-gold-500 text-xs font-black flex items-center justify-center relative group">
                                            {size}
                                            <button type="button" onClick={() => removeEditSize(size)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-1.5">
                                        <input type="number" value={editSizeInput} onChange={(e) => setEditSizeInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEditSize())}
                                            placeholder="40" className="w-12 h-10 bg-[#020617] border border-white/10 rounded-lg text-center text-white text-xs font-black focus:border-gold-500 outline-none"
                                            data-testid="input-edit-size" />
                                        <button type="button" onClick={addEditSize}
                                            className="w-10 h-10 rounded-lg border border-gold-500/50 bg-gold-500/10 text-gold-500 flex items-center justify-center hover:bg-gold-500 hover:text-navy-950 transition-all"
                                            data-testid="button-add-edit-size">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الوصف</label>
                                <textarea rows={3} className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500/50 outline-none transition-all resize-none"
                                    value={editProduct.description || ''} onChange={(e) => setEditProduct({...editProduct, description: e.target.value})} data-testid="input-edit-description"></textarea>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={editUploading}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    data-testid="button-save-edit">
                                    {editUploading ? (<><Loader2 size={16} className="animate-spin" /> جاري الحفظ...</>) : (<><CheckCircle size={16} /> حفظ التعديلات</>)}
                                </button>
                                <button type="button" onClick={closeEditModal}
                                    className="px-5 py-3.5 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-xl hover:bg-white/10 hover:text-white transition-all text-sm">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
