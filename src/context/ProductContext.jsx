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

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        try {
            const cached = localStorage.getItem('products');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });

    const [categories, setCategories] = useState(() => {
        try {
            const cached = localStorage.getItem('categories');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });
    const [heroContent, setHeroContent] = useState(() => {
        try {
            const cached = localStorage.getItem('heroContent');
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            return null;
        }
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(() => {
        try {
            // Chỉ hiển thị loading ở thẻ lần đầu chưa có cache
            const cachedProducts = localStorage.getItem('products');
            const cachedCategories = localStorage.getItem('categories');
            const hasProducts = cachedProducts && cachedProducts !== '[]';
            const hasCategories = cachedCategories && cachedCategories !== '[]';
            return !(hasProducts && hasCategories);
        } catch (e) {
            return true;
        }
    });

    // Initialize database and load data
    useEffect(() => {
        const initDB = async () => {
            try {
                await db.init(); // Test Supabase connection
                await loadData();

                // Check admin status and edit mode from localStorage
                const adminStatus = localStorage.getItem('isAdmin') === 'true';
                const savedEditMode = localStorage.getItem('editMode') === 'true';
                setIsAdmin(adminStatus);
                if (adminStatus) {
                    setEditMode(savedEditMode);
                }
            } catch (error) {
                console.error('Failed to initialize database:', error);
            } finally {
                setLoading(false);
            }
        };

        initDB();
    }, []);

    const loadData = async () => {
        try {
            console.log('Loading data from Supabase...');

            // Thêm timeout nhỏ để không block render lần đầu nếu đã có cache
            await new Promise(resolve => setTimeout(resolve, 0));

            // Fetch song song để tối ưu thời gian chờ
            const [loadedProducts, loadedCategories, heroData] = await Promise.all([
                db.getAll('products').catch(err => {
                    console.warn('Products table error:', err.message);
                    return [];
                }),
                db.getAll('categories').catch(err => {
                    console.warn('Categories table error:', err.message);
                    return [];
                }),
                db.getHero().catch(err => {
                    console.warn('Hero data error:', err.message);
                    return null;
                })
            ]);

            console.log('Loaded products:', loadedProducts?.length || 0, 'items');
            console.log('Loaded categories:', loadedCategories?.length || 0, 'items');
            console.log('Loaded hero:', heroData ? 'Yes' : 'No');

            // Sanitize and set products
            const sanitizedProducts = (loadedProducts || []).map(p => ({
                ...p,
                images: Array.isArray(p.images) ? p.images : [], // Ensure images is array
                sizes: (p.sizes && typeof p.sizes === 'object') ? p.sizes : (p.sizeInventory || {}), // Normalize sizes
                category: p.category || 'new'
            }));
            const sanitizedCategories = loadedCategories || [];

            setProducts(sanitizedProducts);
            setCategories(sanitizedCategories);

            try {
                // Cache cả array images để lần sau load Carousel có sẵn ảnh không chớp giật
                localStorage.setItem('products', JSON.stringify(sanitizedProducts));
                localStorage.setItem('categories', JSON.stringify(sanitizedCategories));
            } catch (storageError) {
                console.warn('Failed to save to localStorage:', storageError);
            }

            setHeroContent(heroData);
            if (heroData) {
                localStorage.setItem('heroContent', JSON.stringify(heroData));
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            // Set empty defaults to prevent crashes
            setProducts([]);
            setCategories([]);
            setHeroContent(null);
        }
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
            // Optimistic Update: Update local state immediately
            setProducts(prevProducts =>
                prevProducts.map(p => p.id === productData.id ? { ...p, ...productData } : p)
            );

            // Perform DB update in background
            await db.update('products', productData);

            // Reload to ensure consistency (optional/debounced in real apps, but good here)
            // await loadData(); // Let's keep this but it might be slight overkill. 
            // Actually, for "instant" feel, we rely on the setProducts above. 
            // The subsequent loadData will just confirm it.
            await loadData();
        } catch (error) {
            console.error('Failed to update product:', error);
            // Revert state on error if needed, or just reload
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
        return products.find(p => p.id === id || p.id === parseInt(id)); // Handle both string UUID and potential legacy number IDs
    };

    const getProductsBySKU = (sku) => {
        return products.find(p => p.sku === sku);
    };

    const getProductsByCategory = (categoryId) => {
        return products.filter(p => p.category === categoryId);
    };

    const searchProducts = async (query) => {
        try {
            return await db.searchProducts(query);
        } catch (error) {
            console.error('Failed to search products:', error);
            return [];
        }
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

    // Admin operations
    const login = async (password) => {
        try {
            // Check password from database
            const correctPassword = await db.getSetting('adminPassword') || 'Tranvandan2110';
            if (password === correctPassword) {
                setIsAdmin(true);
                localStorage.setItem('isAdmin', 'true');
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
            const currentPassword = await db.getSetting('adminPassword') || 'Tranvandan2110';
            if (oldPassword === currentPassword) {
                await db.updateSetting('adminPassword', newPassword);
                localStorage.setItem('adminPassword', newPassword); // For fast local login
                return true;
            }
            return false;
        } catch (error) {
            console.error('Change password error:', error);
            alert('Lỗi cập nhật mật khẩu lên máy chủ. Vui lòng kiểm tra kết nối: ' + error.message);
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
