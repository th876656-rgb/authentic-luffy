import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Edit, Check } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { SkeletonProductCard } from '../components/SkeletonComponents';
import './ProductCarousel.css';

const ProductCarousel = () => {
    const scrollRef = useRef(null);
    const { products, updateProduct, isAdmin, editMode, loading } = useProducts();
    const navigate = useNavigate();
    const [activeQuickEditId, setActiveQuickEditId] = useState(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleQuickCategoryUpdate = async (e, productId, newCategory) => {
        e.stopPropagation();
        try {
            setActiveQuickEditId(null); // Close menu immediately
            await updateProduct({ id: productId, category: newCategory });
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (
        <section className="product-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">SĂN DEAL HOT</h2>
                    <div className="carousel-controls">
                        <button onClick={() => scroll('left')} className="control-btn"><ChevronLeft /></button>
                        <button onClick={() => scroll('right')} className="control-btn"><ChevronRight /></button>
                    </div>
                </div>

                <div className="carousel-container" ref={scrollRef}>
                    {loading ? (
                        Array(5).fill(0).map((_, index) => (
                            <SkeletonProductCard key={index} />
                        ))
                    ) : products.map((product) => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => handleProductClick(product.id)}
                        >
                            <div className="product-image-wrapper">
                                {product.sale_price && <span className="sale-badge">SALE</span>}

                                {product.quantity === 0 && (
                                    <div className="sold-overlay-mini">
                                        <span>SOLD</span>
                                    </div>
                                )}

                                <img src={product.images?.[0] || ''} alt={product.name} className="product-image" />

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
                                <button className="add-to-cart-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product.id);
                                }}>MUA NGAY</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section >
    );
};

export default ProductCarousel;
