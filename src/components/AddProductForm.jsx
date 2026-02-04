import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { Upload, X } from 'lucide-react';
import './AddProductForm.css';

const AddProductForm = ({ categoryId, onClose }) => {
    const { addProduct } = useProducts();
    const availableSizes = [
        '35', '35.5', '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5',
        '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '45.5'
    ];
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        price: '',
        salePrice: '',
        description: '',
        sizeInventory: {}, // Object: { '40': 5, '41': 3, ... }
        category: categoryId,
        images: ['', '', '', '', '', '']
    });
    const [uploading, setUploading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImages = [...formData.images];
                newImages[index] = reader.result;
                setFormData({ ...formData, images: newImages });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index) => {
        const newImages = [...formData.images];
        newImages[index] = '';
        setFormData({ ...formData, images: newImages });
    };

    const updateSizeQuantity = (size, quantity) => {
        const newInventory = { ...formData.sizeInventory };
        const qty = parseInt(quantity) || 0; // Handle NaN and empty string

        if (qty > 0) {
            newInventory[size] = qty;
        } else {
            delete newInventory[size]; // Remove size if quantity is 0 or invalid
        }

        setFormData({ ...formData, sizeInventory: newInventory });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.sku || !formData.name || !formData.price) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Check if at least one size has stock
        if (Object.keys(formData.sizeInventory).length === 0) {
            alert('Vui lòng thêm ít nhất 1 size với số lượng > 0!');
            return;
        }

        // Check if at least one image is uploaded
        if (!formData.images.some(img => img !== '')) {
            alert('Vui lòng tải lên ít nhất 1 ảnh sản phẩm!');
            return;
        }

        try {
            setUploading(true);

            // Generate unique ID
            const id = Date.now();

            // Calculate total quantity from size inventory
            const totalQuantity = Object.values(formData.sizeInventory).reduce((sum, qty) => sum + qty, 0);

            // Prepare product data
            const productData = {
                id,
                sku: formData.sku.trim(), // Trim whitespace
                name: formData.name,
                price: parseFloat(formData.price),
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
                description: formData.description,
                sizeInventory: formData.sizeInventory,
                quantity: totalQuantity, // Auto-calculated from size inventory
                category: formData.category,
                images: formData.images.filter(img => img !== '') // Remove empty images
            };

            console.log('Adding product:', productData); // Debug log
            await addProduct(productData);
            alert('Thêm sản phẩm thành công!');
            onClose();
        } catch (error) {
            console.error('Failed to add product:', error);
            console.error('Error details:', error.message, error.stack);

            // Better error messages
            if (error.message && error.message.includes('uniqueness')) {
                alert(`SKU "${formData.sku}" đã tồn tại! Vui lòng sử dụng SKU khác.`);
            } else {
                alert(`Không thể thêm sản phẩm! Lỗi: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label>SKU *</label>
                    <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="VD: NK-AJ1-001"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Tên sản phẩm *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="VD: Nike Air Jordan 1 Retro High"
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Giá gốc (VNĐ) *</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="3600000"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Giá sale (VNĐ)</label>
                    <input
                        type="number"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        placeholder="3200000"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Tồn kho theo size *</label>
                <div className="size-inventory-grid">
                    {availableSizes.map((size) => (
                        <div key={size} className="size-inventory-item">
                            <label className="size-name">Size {size}</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={formData.sizeInventory[size] || ''}
                                onChange={(e) => updateSizeQuantity(size, e.target.value)}
                                className="size-quantity-input"
                            />
                        </div>
                    ))}
                </div>
                <small className="size-hint">
                    Nhập số lượng cho mỗi size (để trống hoặc 0 nếu không có)
                </small>
            </div>

            <div className="form-group">
                <label>Mô tả</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    rows="4"
                />
            </div>

            <div className="form-group">
                <label>Hình ảnh sản phẩm (Tối đa 6 ảnh) *</label>
                <div className="images-grid">
                    {formData.images.map((img, index) => (
                        <div key={index} className="image-upload-box">
                            {img ? (
                                <>
                                    <img src={img} alt={`Product ${index + 1}`} />
                                    <button
                                        type="button"
                                        className="btn-remove-image"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <label className="upload-placeholder">
                                    <Upload size={24} />
                                    <span>Ảnh {index + 1}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(index, e)}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>
                    Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                    {uploading ? 'Đang thêm...' : 'Thêm sản phẩm'}
                </button>
            </div>
        </form>
    );
};

export default AddProductForm;
