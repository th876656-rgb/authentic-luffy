import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ChevronRight, MessageCircle, Package, Trash2, Edit, Check } from 'lucide-react';
import EditableText from '../components/EditableText';
import EditableImage from '../components/EditableImage';
import SizeInventoryEditor from '../components/SizeInventoryEditor';
import { SkeletonProductDetail } from '../components/SkeletonComponents';
import './ProductDetail.css';

const ProductDetail = () => {
    const { productId } = useParams();
    const { getProductById, updateProduct, deleteProduct, isAdmin, editMode, loading } = useProducts();
    const navigate = useNavigate();
    const product = getProductById(productId);
    const [localCategory, setLocalCategory] = React.useState(product ? product.category : '');

    React.useEffect(() => {
        if (product) {
            setLocalCategory(product.category);
        }
    }, [product]);

    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [showInventoryEditor, setShowInventoryEditor] = useState(false);
    const [activeQuickEditId, setActiveQuickEditId] = useState(null);

    // Show skeleton while loading unique product data
    if (loading && !product) {
        return <SkeletonProductDetail />;
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="not-found">
                        <h2>Không tìm thấy sản phẩm</h2>
                        <button onClick={() => navigate('/')}>Về Trang Chủ</button>
                    </div>
                </div>
            </div>
        );
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const messengerUrl = 'https://www.facebook.com/messages/t/108426057420816';

    // Save handlers
    const handleSaveSKU = async (newValue) => {
        await updateProduct({ ...product, sku: newValue });
    };

    const handleSaveName = async (newValue) => {
        await updateProduct({ ...product, name: newValue });
    };

    const handleSavePrice = async (newValue) => {
        const price = parseFloat(newValue.replace(/[^\d]/g, ''));
        if (!isNaN(price)) {
            await updateProduct({ ...product, price });
        }
    };

    const handleSaveSalePrice = async (newValue) => {
        const sale_price = parseFloat(newValue.replace(/[^\d]/g, ''));
        if (!isNaN(sale_price)) {
            await updateProduct({ ...product, sale_price });
        }
    };

    const handleSaveDescription = async (newValue) => {
        await updateProduct({ ...product, description: newValue });
    };

    const handleSaveImage = async (index, newImageSrc) => {
        const newImages = [...product.images];
        newImages[index] = newImageSrc;
        await updateProduct({ ...product, images: newImages });
    };

    const handleSaveCategory = async (newValue) => {
        // Optimistic update
        setLocalCategory(newValue);
        await updateProduct({ ...product, category: newValue });
    };

    const handleQuickCategoryUpdate = async (e, productId, newCategory) => {
        e.stopPropagation();
        try {
            await updateProduct({ id: productId, category: newCategory });
            setActiveQuickEditId(null);
            alert('Đã cập nhật danh mục thành công!');
        } catch (error) {
            alert('Lỗi cập nhật danh mục: ' + error.message);
        }
    };

    const handleDeleteProduct = async () => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await deleteProduct(product.id);
                alert('Đã xóa sản phẩm thành công!');
                navigate('/'); // Navigate back to home after delete
            } catch (error) {
                alert('Không thể xóa sản phẩm!');
            }
        }
    };

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <ChevronRight size={16} />
                    <Link to={`/category/${product.category}`}>Danh mục</Link>
                    <ChevronRight size={16} />
                    <span>{product.name}</span>
                </div>

                <div className="product-detail-grid">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <EditableImage
                                src={product.images?.[mainImageIndex] || ''}
                                alt={product.name}
                                onSave={(newSrc) => handleSaveImage(mainImageIndex, newSrc)}
                            />
                            {product.quantity === 0 && (
                                <div className="sold-overlay">
                                    <div className="sold-stamp">SOLD OUT</div>
                                </div>

                            )}

                            {isAdmin && editMode && (
                                <div className="quick-edit-wrapper-detail" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="btn-quick-edit-detail"
                                        onClick={() => setActiveQuickEditId(activeQuickEditId === product.id ? null : product.id)}
                                    >
                                        <Edit size={16} /> Sửa Danh Mục
                                    </button>

                                    {activeQuickEditId === product.id && (
                                        <div className="quick-edit-menu-detail">
                                            <button onClick={(e) => handleQuickCategoryUpdate(e, product.id, 'new')} className={product.category === 'new' ? 'active' : ''}>
                                                Hàng mới về {product.category === 'new' && <Check size={14} />}
                                            </button>
                                            <button onClick={(e) => handleQuickCategoryUpdate(e, product.id, 'daily')} className={product.category === 'daily' ? 'active' : ''}>
                                                Giày đi hàng ngày {product.category === 'daily' && <Check size={14} />}
                                            </button>
                                            <button onClick={(e) => handleQuickCategoryUpdate(e, product.id, 'sports')} className={product.category === 'sports' ? 'active' : ''}>
                                                Giày thể thao {product.category === 'sports' && <Check size={14} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="thumbnail-grid">
                            {(product.images || []).slice(0, 6).map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${index === mainImageIndex ? 'active' : ''}`}
                                    onClick={() => setMainImageIndex(index)}
                                >
                                    <EditableImage
                                        src={img}
                                        alt={`${product.name} ${index + 1}`}
                                        onSave={(newSrc) => handleSaveImage(index, newSrc)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-details">
                        <EditableText
                            value={product.name}
                            onSave={handleSaveName}
                            tag="h1"
                            className="product-title"
                        />

                        <div className="product-sku">
                            SKU: <EditableText
                                value={product.sku}
                                onSave={handleSaveSKU}
                                tag="span"
                            />
                        </div>

                        <div className="product-pricing">
                            {product.sale_price ? (
                                <>
                                    <EditableText
                                        value={formatPrice(product.price)}
                                        onSave={handleSavePrice}
                                        tag="span"
                                        className="price-original"
                                    />
                                    <EditableText
                                        value={formatPrice(product.sale_price)}
                                        onSave={handleSaveSalePrice}
                                        tag="span"
                                        className="price-sale"
                                    />
                                    <span className="discount-badge">
                                        -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                                    </span>
                                </>
                            ) : (
                                <EditableText
                                    value={formatPrice(product.price)}
                                    onSave={handleSavePrice}
                                    tag="span"
                                    className="price-regular"
                                />
                            )}
                        </div>

                        <div className="product-description">
                            <EditableText
                                value={product.description || 'Thêm mô tả sản phẩm...'}
                                onSave={handleSaveDescription}
                                tag="p"
                                multiline={true}
                            />
                        </div>

                        {/* Size Selection with Inventory */}
                        <div className="size-selection">
                            <div className="size-header">
                                <h3>Kích thước:</h3>
                                {isAdmin && editMode && (
                                    <button
                                        className="btn-edit-inventory"
                                        onClick={() => setShowInventoryEditor(true)}
                                    >
                                        <Package size={16} />
                                        Quản lý tồn kho
                                    </button>
                                )}
                            </div>
                            <div className="size-options">
                                {(() => {
                                    // Determine if we have inventory object or legacy array
                                    const inventory = (product.sizes && !Array.isArray(product.sizes)) ? product.sizes : product.sizeInventory;
                                    const legacySizes = Array.isArray(product.sizes) ? product.sizes : null;

                                    if (inventory) {
                                        return Object.entries(inventory).map(([size, qty]) => (
                                            <div
                                                key={size}
                                                className={`size-option ${qty === 0 ? 'sold-out' : ''} ${qty > 0 && qty <= 2 ? 'low-stock' : ''}`}
                                            >
                                                {size}
                                                {qty > 0 && qty <= 2 && <span className="stock-badge">Sắp hết</span>}
                                                {qty === 0 && <span className="stock-badge out">Hết</span>}
                                            </div>
                                        ));
                                    } else if (legacySizes) {
                                        return legacySizes.map((size) => (
                                            <div key={size} className="size-option">{size}</div>
                                        ));
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="stock-status">
                            {product.quantity === 0 ? (
                                <span className="out-of-stock">Hết hàng</span>
                            ) : product.quantity <= 3 ? (
                                <span className="low-stock">Chỉ còn {product.quantity} sản phẩm!</span>
                            ) : (
                                <span className="in-stock">Còn hàng</span>
                            )}
                        </div>

                        {/* Contact Button */}
                        <a
                            href={messengerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-contact-messenger"
                        >
                            <MessageCircle size={20} />
                            Liên hệ qua Messenger
                        </a>

                        {/* Delete Button - Admin Only */}
                        {isAdmin && editMode && (
                            <button
                                className="btn-delete-product-detail"
                                onClick={handleDeleteProduct}
                            >
                                <Trash2 size={20} />
                                Xóa Sản Phẩm
                            </button>
                        )}

                        {/* Product Meta */}
                        <div className="product-meta">
                            <div className="meta-item">
                                <strong>Danh mục:</strong>{' '}

                                {isAdmin && editMode ? (
                                    <select
                                        className="category-dropdown"
                                        value={localCategory || 'new'}
                                        onChange={(e) => handleSaveCategory(e.target.value)}
                                        onClick={(e) => e.stopPropagation()} // Prevent accidental clicks
                                    >
                                        <option value="new">Hàng mới về</option>
                                        <option value="daily">Giày đi hàng ngày</option>
                                        <option value="sports">Giày thể thao</option>
                                    </select>
                                ) : (
                                    <span>
                                        {product.category === 'new' ? 'Hàng mới về' :
                                            product.category === 'daily' ? 'Giày đi hàng ngày' :
                                                product.category === 'sports' ? 'Giày thể thao' : product.category}
                                    </span>
                                )}
                            </div>
                            <div className="meta-item">
                                <strong>Tình trạng:</strong> 100% Authentic
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Size Inventory Editor Modal */}
            {
                showInventoryEditor && (
                    <SizeInventoryEditor
                        product={product}
                        onClose={() => setShowInventoryEditor(false)}
                    />
                )
            }
        </div >
    );
};

export default ProductDetail;
