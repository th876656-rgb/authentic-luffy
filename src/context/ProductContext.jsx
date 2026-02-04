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
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [heroContent, setHeroContent] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

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
            const [loadedProducts, loadedCategories, heroData] = await Promise.all([
                db.getAll('products'),
                db.getAll('categories'),
                db.getHero() // Use getHero() method for Supabase
            ]);

            console.log('Loaded products:', loadedProducts);
            console.log('Loaded categories:', loadedCategories);
            console.log('Loaded hero:', heroData);

            setProducts(loadedProducts || []);
            setCategories(loadedCategories || []);
            setHeroContent(heroData);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    // Product operations
    const addProduct = async (productData) => {
        try {
            const id = await db.add('products', productData);
            await loadData();
            return id;
        } catch (error) {
            console.error('Failed to add product:', error);
            throw error;
        }
    };

    const updateProduct = async (productData) => {
        try {
            await db.update('products', productData);
            await loadData();
        } catch (error) {
            console.error('Failed to update product:', error);
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
        return products.find(p => p.id === parseInt(id));
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
            await db.update('hero', { ...heroData, id: 'main' });
            await loadData();
        } catch (error) {
            console.error('Failed to update hero content:', error);
            throw error;
        }
    };

    // Admin operations
    const login = (password) => {
        // Simple password check - in production, use proper authentication
        const correctPassword = localStorage.getItem('adminPassword') || 'admin123';
        if (password === correctPassword) {
            setIsAdmin(true);
            localStorage.setItem('isAdmin', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        setEditMode(false);
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('editMode');
    };

    const changePassword = (oldPassword, newPassword) => {
        const currentPassword = localStorage.getItem('adminPassword') || 'admin123';
        if (oldPassword === currentPassword) {
            localStorage.setItem('adminPassword', newPassword);
            return true;
        }
        return false;
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
