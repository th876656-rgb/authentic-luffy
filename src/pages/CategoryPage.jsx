import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Plus, Trash2, Edit } from 'lucide-react';
import AddProductForm from '../components/AddProductForm';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const { getProductsByCategory, getCategoryById, isAdmin, editMode, deleteProduct, addProduct } = useProducts();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);

    const category = getCategoryById(categoryId) || { title: 'Hàng Mới Về', subtitle: 'Bộ sưu tập mới nhất' };
    const products = getProductsByCategory(categoryId);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
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
                <div className="products-grid">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className={`product-card ${product.quantity === 0 ? 'sold-out' : ''}`}
                            onClick={() => handleProductClick(product.id)}
                        >
                            {product.salePrice && <span className="sale-badge">SALE</span>}
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
                            </div>

                            <div className="product-info">
                                <div className="product-sku">SKU: {product.sku}</div>
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-price">
                                    {product.salePrice ? (
                                        <>
                                            <span className="price-original">{formatPrice(product.price)}</span>
                                            <span className="price-sale">{formatPrice(product.salePrice)}</span>
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
