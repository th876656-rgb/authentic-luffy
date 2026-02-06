
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, MoreHorizontal, Check } from 'lucide-react';
import AddProductForm from '../components/AddProductForm';
import { SkeletonProductCard } from '../components/SkeletonComponents';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryId: paramCategoryId } = useParams();
    const location = useLocation();

    // Determine category ID: handle /new-arrivals with or without trailing slash
    const isNewArrivals = location.pathname.includes('/new-arrivals');
    const categoryId = isNewArrivals ? 'new' : paramCategoryId;

    const { getProductsByCategory, getCategoryById, isAdmin, editMode, deleteProduct, addProduct, updateProduct, loading } = useProducts();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [activeQuickEditId, setActiveQuickEditId] = useState(null);

    const category = getCategoryById(categoryId) || { title: 'Hàng Mới Về', subtitle: 'Bộ sưu tập mới nhất' };
    const allProducts = getProductsByCategory(categoryId);

    // Available sizes for filter
    const AVAILABLE_SIZES = [
        '35', '35.5', '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5',
        '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '45.5'
    ];

    // Filter logic
    const products = selectedSizes.length === 0
        ? allProducts
        : allProducts.filter(product => {
            // Check for new inventory format (Object)
            if (product.sizes && !Array.isArray(product.sizes) && typeof product.sizes === 'object') {
                // Return true if ANY selected size has quantity > 0
                return selectedSizes.some(size => product.sizes[size] > 0);
            }
            // Check for legacy inventory format (Array)
            if (Array.isArray(product.sizes)) {
                return selectedSizes.some(size => product.sizes.includes(size));
            }
            // Check for sizeInventory field (fallback)
            if (product.sizeInventory && typeof product.sizeInventory === 'object') {
                return selectedSizes.some(size => product.sizeInventory[size] > 0);
            }
            return false;
        });

    const toggleSize = (size) => {
        setSelectedSizes(prev => {
            if (prev.includes(size)) {
                return prev.filter(s => s !== size);
            } else {
                return [...prev, size];
            }
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleProductClick = (productId) => {
        navigate(`/ product / ${productId} `);
    };

    const handleDeleteProduct = async (e, productId) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await deleteProduct(productId);
            } catch (error) {
                alert('Không thể xóa sản phẩm!');
            }
        }
    };

    const handleQuickCategoryUpdate = async (e, productId, newCategory) => {
        e.stopPropagation();
        try {
            setActiveQuickEditId(null); // Close menu immediately
            await updateProduct({ id: productId, category: newCategory });
            // No alert needed, UI updates optimistically
        } catch (error) {
            alert('Lỗi cập nhật danh mục: ' + error.message);
        }
    };

    return (
        <div className="category-page">
            <div className="category-header">
                <div className="container">
                    <h1>{category.title}</h1>
                    <p>{category.subtitle}</p>
                    {isAdmin && editMode && (
                        <button className="btn-add-product" onClick={() => setShowAddModal(true)}>
                            <Plus size={20} />
                            Thêm Sản Phẩm Mới
                        </button>
                    )}
                </div>
            </div>

            <div className="container">
                {/* Size Filter Section */}
                <div className="size-filter-section">
                    <span className="filter-label">Lọc theo size:</span>
                    <div className="size-buttons">
                        {AVAILABLE_SIZES.map(size => (
                            <button
                                key={size}
                                className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                                onClick={() => toggleSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="products-grid">
                    {loading ? (
                        Array(8).fill(0).map((_, index) => (
                            <SkeletonProductCard key={index} />
                        ))
                    ) : products.map((product) => (
                        <div
                            key={product.id}
                            className={`product-card ${product.quantity === 0 ? 'sold-out' : ''}`}
                            onClick={() => handleProductClick(product.id)}
                        >
                            {product.sale_price && <span className="sale-badge">SALE</span>}
                            {product.quantity === 0 && (
                                <div className="sold-overlay">
                                    <div className="sold-stamp">SOLD OUT</div>
                                </div>
                            )}
                            {product.quantity > 0 && product.quantity <= 3 && (
                                <div className="urgency-badge">Chỉ còn {product.quantity}</div>
                            )}

                            <div className="product-image-wrapper">
                                <img src={product.images[0]} alt={product.name} />

                                {isAdmin && editMode && (
                                    <div className="quick-edit-wrapper" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="btn-quick-edit"
                                            onClick={() => setActiveQuickEditId(activeQuickEditId === product.id ? null : product.id)}
                                        >
                                            <Edit size={14} /> Sửa
                                        </button>

                                        {activeQuickEditId === product.id && (
                                            <div className="quick-edit-menu">
                                                <button onClick={(e) => handleQuickCategoryUpdate(e, product.id, 'new')} className={product.category === 'new' ? 'active' : ''}>
                                                    Hàng mới về {product.category === 'new' && <Check size={12} />}
                                                </button>
                                                <button onClick={(e) => handleQuickCategoryUpdate(e, product.id, 'daily')} className={product.category === 'daily' ? 'active' : ''}>
                                                    Giày đi hàng ngày {product.category === 'daily' && <Check size={12} />}
                                                </button>
                                                <button onClick={(e) => handleQuickCategoryUpdate(e, product.id, 'sports')} className={product.category === 'sports' ? 'active' : ''}>
                                                    Giày thể thao {product.category === 'sports' && <Check size={12} />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="product-info">
                                <div className="product-sku">SKU: {product.sku}</div>
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-price">
                                    {product.sale_price ? (
                                        <>
                                            <span className="price-original">{formatPrice(product.price)}</span>
                                            <span className="price-sale">{formatPrice(product.sale_price)}</span>
                                        </>
                                    ) : (
                                        <span className="price-regular">{formatPrice(product.price)}</span>
                                    )}
                                </div>

                                {isAdmin && editMode && (
                                    <button
                                        className="btn-delete-product"
                                        onClick={(e) => handleDeleteProduct(e, product.id)}
                                    >
                                        <Trash2 size={16} />
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="no-products">
                        <p>Chưa có sản phẩm nào trong danh mục này.</p>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content add-product-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Thêm Sản Phẩm Mới</h2>
                        <AddProductForm
                            categoryId={categoryId}
                            onClose={() => setShowAddModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
