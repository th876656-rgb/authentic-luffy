import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './SizeInventoryEditor.css';

const SizeInventoryEditor = ({ product, onClose }) => {
    const { updateProduct } = useProducts();
    const availableSizes = [
        '35', '35.5', '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5',
        '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '45.5'
    ];

    // Initialize inventory: check sizes (JSONB) or fallback to empty
    // If sizes is an array (legacy), ignore it for editing inventory (start fresh or migrate logic needed?)
    // If sizes is an object, use it.
    const getInitialInventory = () => {
        if (product.sizeInventory) return product.sizeInventory; // Fallback for in-memory legacy
        if (product.sizes && !Array.isArray(product.sizes)) return product.sizes; // Valid inventory object
        return {}; // Default empty if sizes is array (legacy data) or null
    };

    const [inventory, setInventory] = useState(getInitialInventory());
    const [saving, setSaving] = useState(false);

    const updateQuantity = (size, change) => {
        const currentQty = inventory[size] || 0;
        const newQty = Math.max(0, currentQty + change);

        const newInventory = { ...inventory };
        if (newQty > 0) {
            newInventory[size] = newQty;
        } else {
            delete newInventory[size];
        }

        setInventory(newInventory);
    };

    const setQuantity = (size, value) => {
        const qty = parseInt(value) || 0;
        const newInventory = { ...inventory };

        if (qty > 0) {
            newInventory[size] = qty;
        } else {
            delete newInventory[size];
        }

        setInventory(newInventory);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Calculate total quantity
            const totalQuantity = Object.values(inventory).reduce((sum, qty) => sum + qty, 0);

            // Update product - Map inventory to 'sizes' column
            await updateProduct({
                ...product,
                sizes: inventory,
                quantity: totalQuantity
            });

            alert('Cập nhật tồn kho thành công!');
            onClose();
        } catch (error) {
            console.error('Failed to update inventory:', error);
            alert('Không thể cập nhật tồn kho!');
        } finally {
            setSaving(false);
        }
    };

    const getTotalStock = () => {
        return Object.values(inventory).reduce((sum, qty) => sum + qty, 0);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content size-editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Quản Lý Tồn Kho</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="product-info-header">
                    <div className="product-name">{product.name}</div>
                    <div className="product-sku">SKU: {product.sku}</div>
                    <div className="total-stock">
                        Tổng tồn kho: <strong>{getTotalStock()}</strong> đôi
                    </div>
                </div>

                <div className="size-editor-grid">
                    {availableSizes.map((size) => {
                        const qty = inventory[size] || 0;
                        const isLowStock = qty > 0 && qty <= 2;
                        const isOutOfStock = qty === 0;

                        return (
                            <div
                                key={size}
                                className={`size-editor-item ${isLowStock ? 'low-stock' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                            >
                                <div className="size-label">Size {size}</div>
                                <div className="quantity-controls">
                                    <button
                                        type="button"
                                        className="btn-quantity"
                                        onClick={() => updateQuantity(size, -1)}
                                        disabled={qty === 0}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <input
                                        type="number"
                                        min="0"
                                        value={qty}
                                        onChange={(e) => setQuantity(size, e.target.value)}
                                        className="quantity-input"
                                    />
                                    <button
                                        type="button"
                                        className="btn-quantity"
                                        onClick={() => updateQuantity(size, 1)}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {isLowStock && <div className="stock-badge low">Sắp hết</div>}
                                {isOutOfStock && <div className="stock-badge out">Hết hàng</div>}
                            </div>
                        );
                    })}
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SizeInventoryEditor;
