import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ChevronRight, MessageCircle, Package, Trash2, Edit, Check, Camera, Plus } from 'lucide-react';
import EditableText from '../components/EditableText';
import EditableImage from '../components/EditableImage';
import SizeInventoryEditor from '../components/SizeInventoryEditor';
import { SkeletonProductDetail } from '../components/SkeletonComponents';
import { uploadToCloudinary } from '../utils/cloudinary';
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
    const [selectedSize, setSelectedSize] = useState(null);
    const [uploadingSlot, setUploadingSlot] = useState(null); // index đang upload
    const imageInputRefs = useRef([]);

    const MAX_IMAGES = 6;

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

    const handleContactMessenger = async (e) => {
        e.preventDefault();

        // Construct message details
        const productUrl = window.location.href;
        const sizeText = selectedSize ? `Size: ${selectedSize}` : 'Chưa chọn size';
        const priceText = product.sale_price ? formatPrice(product.sale_price) : formatPrice(product.price);

        const message = `
Thông tin sản phẩm:
- Tên: ${product.name}
- Giá: ${priceText}
- ${sizeText}
- Link: ${productUrl}
        `.trim();

        const copyToClipboard = async (text) => {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
                throw new Error('Clipboard API not available');
            } catch (err) {
                // Fallback for older browsers or non-secure contexts
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-9999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return successful;
                } catch (fallbackErr) {
                    console.error('Fallback copy failed:', fallbackErr);
                    return false;
                }
            }
        };

        const success = await copyToClipboard(message);

        if (success) {
            alert('Đã copy thông tin sản phẩm! Bạn hãy dán (Paste) vào Messenger nhé.');
        } else {
            alert('Không thể tự động copy. Bạn vui lòng gửi link sản phẩm cho shop nhé!');
        }

        window.open(messengerUrl, '_blank');
    };

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
        const newImages = [...(product.images || [])];
        // Đảm bảo mảng đủ dài
        while (newImages.length <= index) newImages.push('');
        newImages[index] = newImageSrc;
        await updateProduct({ ...product, images: newImages.filter((_, i) => i <= index || _) });
    };

    // Upload ảnh trực tiếp từ file input (cho ô thumbnail)
    const handleDirectUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploadingSlot(index);
            const url = await uploadToCloudinary(file, 'authentic-luffy/products');
            await handleSaveImage(index, url);
            setMainImageIndex(index); // Chuyển sang ảnh vừa upload
        } catch (err) {
            alert('Upload ảnh thất bại: ' + err.message);
        } finally {
            setUploadingSlot(null);
            if (e.target) e.target.value = '';
        }
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
                                                Giày thời trang {product.category === 'daily' && <Check size={14} />}
                                            </button>
                                            <button onClick={(e) => handleQuickCategoryUpdate(e, product.id, 'sports')} className={product.category === 'sports' ? 'active' : ''}>
                                                Giày thể thao {product.category === 'sports' && <Check size={14} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Thumbnail grid */}
                        <div className="thumbnail-grid">
                            {isAdmin && editMode ? (
                                // Admin mode: hiển thị đủ 6 ô ảnh
                                Array.from({ length: MAX_IMAGES }).map((_, index) => {
                                    const img = (product.images || [])[index];
                                    const isUploading = uploadingSlot === index;
                                    return (
                                        <div
                                            key={index}
                                            className={`thumbnail ${index === mainImageIndex ? 'active' : ''} ${!img ? 'empty-slot' : ''}`}
                                            style={{ position: 'relative', cursor: 'pointer' }}
                                        >
                                            {img ? (
                                                <>
                                                    <img
                                                        src={img}
                                                        alt={`${product.name} ${index + 1}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onClick={() => setMainImageIndex(index)}
                                                    />
                                                    {/* Nút đổi ảnh rõ ràng */}
                                                    <label
                                                        style={{
                                                            position: 'absolute', inset: 0,
                                                            background: 'rgba(0,0,0,0.5)',
                                                            display: 'flex', flexDirection: 'column',
                                                            alignItems: 'center', justifyContent: 'center',
                                                            color: 'white', fontSize: '11px', cursor: 'pointer',
                                                            opacity: 0, transition: 'opacity 0.2s',
                                                            borderRadius: '4px'
                                                        }}
                                                        className="img-edit-hover"
                                                        title="Đổi ảnh"
                                                    >
                                                        <Camera size={18} />
                                                        <span>Đổi ảnh</span>
                                                        <input
                                                            type="file" accept="image/*"
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => handleDirectUpload(index, e)}
                                                        />
                                                    </label>
                                                    {isUploading && (
                                                        <div style={{
                                                            position: 'absolute', inset: 0,
                                                            background: 'rgba(0,0,0,0.7)',
                                                            display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', color: 'white', fontSize: '11px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            ⏳ Đang tải...
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                // Ô trống - thêm ảnh mới
                                                <label style={{
                                                    display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    width: '100%', height: '100%',
                                                    border: '2px dashed #555', borderRadius: '4px',
                                                    color: '#888', cursor: 'pointer', fontSize: '11px',
                                                    gap: '4px', background: '#1a1a1a'
                                                }}>
                                                    {isUploading ? (
                                                        <span style={{ color: '#aaa' }}>⏳ Đang tải...</span>
                                                    ) : (
                                                        <>
                                                            <Plus size={20} color="#666" />
                                                            <span>Ảnh {index + 1}</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file" accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => handleDirectUpload(index, e)}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                // Normal mode: hiển thị ảnh hiện có
                                (product.images || []).slice(0, 6).map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${index === mainImageIndex ? 'active' : ''}`}
                                        onClick={() => setMainImageIndex(index)}
                                    >
                                        <img src={img} alt={`${product.name} ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))
                            )}
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
                                                className={`size-option ${qty === 0 ? 'sold-out' : ''} ${qty > 0 && qty <= 2 ? 'low-stock' : ''} ${selectedSize === size ? 'selected' : ''}`}
                                                onClick={() => qty > 0 && setSelectedSize(size)}
                                            >
                                                {size}
                                                {qty > 0 && qty <= 2 && <span className="stock-badge">Sắp hết</span>}
                                                {qty === 0 && <span className="stock-badge out">Hết</span>}
                                            </div>
                                        ));
                                    } else if (legacySizes) {
                                        return legacySizes.map((size) => (
                                            <div
                                                key={size}
                                                className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </div>
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
                            onClick={handleContactMessenger}
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
                                        <option value="daily">Giày thời trang</option>
                                        <option value="sports">Giày thể thao</option>
                                    </select>
                                ) : (
                                    <span>
                                        {product.category === 'new' ? 'Hàng mới về' :
                                            product.category === 'daily' ? 'Giày thời trang' :
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
