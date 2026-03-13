import React, { createContext, useContext, useState, useEffect } from 'react';
import db from '../utils/db';

const ProductContext = createContext();

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within ProductProvider');
    }
    return context;
};

// Cache TTL: 5 phút để giảm calls Supabase
const CACHE_TTL = 5 * 60 * 1000;

function getCachedData(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // Nếu có timestamp thì kiểm tra TTL, nếu không thì dùng luôn (legacy cache)
        if (parsed && parsed.__timestamp) {
            if (Date.now() - parsed.__timestamp > CACHE_TTL) return null;
            return parsed.data;
        }
        return parsed;
    } catch (e) {
        return null;
    }
}

function setCachedData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ data, __timestamp: Date.now() }));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
}

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        try {
            const cached = getCachedData('products');
            return cached || [];
        } catch (e) {
            return [];
        }
    });

    const [categories, setCategories] = useState(() => {
        try {
            const cached = getCachedData('categories');
            return cached || [];
        } catch (e) {
            return [];
        }
    });

    const [heroContent, setHeroContent] = useState(() => {
        try {
            const cached = getCachedData('heroContent');
            return cached || null;
        } catch (e) {
            return null;
        }
    });

    const [isAdmin, setIsAdmin] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [supabaseAvailable, setSupabaseAvailable] = useState(true);
    const [loading, setLoading] = useState(() => {
        try {
            const cachedProducts = getCachedData('products');
            const cachedCategories = getCachedData('categories');
            const hasProducts = cachedProducts && cachedProducts.length > 0;
            const hasCategories = cachedCategories && cachedCategories.length > 0;
            return !(hasProducts && hasCategories);
        } catch (e) {
            return true;
        }
    });

    // Initialize database and load data
    useEffect(() => {
        const initDB = async () => {
            try {
                // Kiểm tra xem có cache không. Nếu có, hiển thị ngay
                const cachedProducts = getCachedData('products');
                const cachedCategories = getCachedData('categories');
                const hasValidCache = cachedProducts && cachedProducts.length > 0 &&
                    cachedCategories && cachedCategories.length > 0;

                if (hasValidCache) {
                    // Hiển thị data từ cache trước, rồi mới fetch Supabase sau
                    setLoading(false);
                    // Fetch trong background không blocking
                    loadDataFromSupabase().catch(err => {
                        console.warn('Background sync from Supabase failed:', err.message);
                    });
                } else {
                    // Không có cache, phải đợi Supabase
                    await loadData();
                }

                // Check admin status
                const adminStatus = localStorage.getItem('isAdmin') === 'true';
                const savedEditMode = localStorage.getItem('editMode') === 'true';
                setIsAdmin(adminStatus);
                if (adminStatus) {
                    setEditMode(savedEditMode);
                }
            } catch (error) {
                console.error('Failed to initialize database:', error);
                // Vẫn dùng cache nếu có
                setLoading(false);
            }
        };

        initDB();
    }, []);

    // Load data với fallback cache khi Supabase lỗi
    const loadData = async () => {
        try {
            const result = await loadDataFromSupabase();
            return result;
        } catch (error) {
            console.warn('Supabase not available, using cached data:', error.message);
            setSupabaseAvailable(false);
            // Dùng cache cũ nếu Supabase lỗi
            const cachedProducts = getCachedData('products') || [];
            const cachedCategories = getCachedData('categories') || [];
            const cachedHero = getCachedData('heroContent') || null;
            if (cachedProducts.length > 0) {
                setProducts(cachedProducts);
                setCategories(cachedCategories);
                setHeroContent(cachedHero);
            }
            setLoading(false);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const loadDataFromSupabase = async () => {
        console.log('Loading data from Supabase...');

        const [loadedProducts, loadedCategories, heroData] = await Promise.all([
            db.getAll('products').catch(err => {
                console.warn('Products table error:', err.message);
                return null;
            }),
            db.getAll('categories').catch(err => {
                console.warn('Categories table error:', err.message);
                return null;
            }),
            db.getHero().catch(err => {
                console.warn('Hero data error:', err.message);
                return undefined;
            })
        ]);

        // Nếu tất cả đều null → Supabase bị hạn chế
        if (loadedProducts === null && loadedCategories === null) {
            throw new Error('Supabase service restricted (egress quota exceeded)');
        }

        // Sanitize products
        const sanitizedProducts = (loadedProducts || []).map(p => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : [],
            sizes: (p.sizes && typeof p.sizes === 'object') ? p.sizes : (p.sizeInventory || {}),
            category: p.category || 'new'
        }));
        const sanitizedCategories = loadedCategories || [];

        console.log('Loaded products:', sanitizedProducts.length, 'items');
        console.log('Loaded categories:', sanitizedCategories.length, 'items');

        setProducts(sanitizedProducts);
        setCategories(sanitizedCategories);
        setSupabaseAvailable(true);

        // Lưu cache với TTL
        setCachedData('products', sanitizedProducts);
        setCachedData('categories', sanitizedCategories);

        if (heroData !== undefined && heroData !== null) {
            setHeroContent(heroData);
            setCachedData('heroContent', heroData);
        } else if (heroData === undefined) {
            // Lỗi hero data, giữ nguyên cache cũ
        } else {
            setHeroContent(null);
        }

        return { products: sanitizedProducts, categories: sanitizedCategories, hero: heroData };
    };

    // Product operations
    const addProduct = async (productData) => {
        try {
            const result = await db.add('products', productData);
            await loadData();
            return result?.id;
        } catch (error) {
            console.error('Failed to add product:', error);
            throw error;
        }
    };

    const updateProduct = async (productData) => {
        try {
            setProducts(prevProducts =>
                prevProducts.map(p => p.id === productData.id ? { ...p, ...productData } : p)
            );
            await db.update('products', productData);
            await loadData();
        } catch (error) {
            console.error('Failed to update product:', error);
            await loadData();
            throw error;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await db.delete('products', productId);
            await loadData();
        } catch (error) {
            console.error('Failed to delete product:', error);
            throw error;
        }
    };

    const getProductById = (id) => {
        return products.find(p => p.id === id || p.id === parseInt(id));
    };

    const getProductsBySKU = (sku) => {
        return products.find(p => p.sku === sku);
    };

    const getProductsByCategory = (categoryId) => {
        return products.filter(p => p.category === categoryId);
    };

    const searchProducts = async (query) => {
        try {
            if (supabaseAvailable) {
                return await db.searchProducts(query);
            }
        } catch (error) {
            console.warn('Search via Supabase failed, using local search');
        }
        // Fallback: tìm kiếm trên cache local
        const q = query.toLowerCase();
        return products.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
    };

    // Category operations
    const updateCategory = async (categoryId, data) => {
        try {
            const category = categories.find(c => c.id === categoryId);
            if (!category) throw new Error('Category not found');
            const updatedCategory = { ...category, ...data };
            await db.update('categories', updatedCategory);
            await loadData();
        } catch (error) {
            console.error('Failed to update category:', error);
            throw error;
        }
    };

    const getCategoryById = (id) => {
        return categories.find(c => c.id === id);
    };

    // Hero content operations
    const updateHeroContent = async (heroData) => {
        try {
            await db.updateHero(heroData);
            await loadData();
        } catch (error) {
            console.error('Failed to update hero content:', error);
            throw error;
        }
    };

    // Admin operations - với fallback khi Supabase không khả dụng
    const login = async (password) => {
        try {
            // Thử lấy password từ Supabase
            let correctPassword = null;
            try {
                correctPassword = await db.getSetting('adminPassword');
            } catch (supabaseErr) {
                console.warn('Cannot reach Supabase for auth, using local fallback');
            }

            // Fallback: dùng password lưu local hoặc mặc định
            if (!correctPassword) {
                correctPassword = localStorage.getItem('adminPassword') || 'Tranvandan2110';
            }

            if (password === correctPassword) {
                setIsAdmin(true);
                localStorage.setItem('isAdmin', 'true');
                // Lưu password local để dùng khi offline
                localStorage.setItem('adminPassword', correctPassword);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            alert('Lỗi kết nối máy chủ khi đăng nhập: ' + error.message);
            return false;
        }
    };

    const logout = () => {
        setIsAdmin(false);
        setEditMode(false);
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('editMode');
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            let currentPassword = null;
            try {
                currentPassword = await db.getSetting('adminPassword');
            } catch (e) {
                console.warn('Cannot reach Supabase, checking local password');
            }
            if (!currentPassword) {
                currentPassword = localStorage.getItem('adminPassword') || 'Tranvandan2110';
            }

            if (oldPassword === currentPassword) {
                try {
                    await db.updateSetting('adminPassword', newPassword);
                } catch (e) {
                    console.warn('Cannot update password on Supabase, saved locally only');
                }
                localStorage.setItem('adminPassword', newPassword);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Change password error:', error);
            alert('Lỗi cập nhật mật khẩu. Vui lòng kiểm tra kết nối: ' + error.message);
            return false;
        }
    };

    const toggleEditMode = () => {
        if (isAdmin) {
            const newEditMode = !editMode;
            setEditMode(newEditMode);
            localStorage.setItem('editMode', newEditMode.toString());
        }
    };

    const value = {
        // State
        products,
        categories,
        heroContent,
        isAdmin,
        editMode,
        loading,
        supabaseAvailable,

        // Product operations
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductsBySKU,
        getProductsByCategory,
        searchProducts,

        // Category operations
        updateCategory,
        getCategoryById,

        // Hero operations
        updateHeroContent,

        // Admin operations
        login,
        logout,
        changePassword,
        toggleEditMode,

        // Utility
        refreshData: loadData
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
