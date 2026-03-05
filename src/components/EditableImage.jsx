import React, { useState, useRef } from 'react';
import { Upload, Save, X, Image as ImageIcon, Layers } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './EditableImage.css';

// Preset futuristic backgrounds
const PRESET_BACKGROUNDS = [
    { id: 'none', label: 'Không nền', url: null },
    { id: 'city', label: 'Thành Phố Tương Lai', url: '/bg_city.png' },
    { id: 'white', label: 'Studio Hiện Đại', url: '/bg_white.png' },
    { id: 'gradient', label: 'Holographic', url: '/bg_gradient.png' },
    { id: 'dark_glow', label: 'Cyberpunk Tối', url: '/bg_dark_glow.png' },
];

const EditableImage = ({
    src,
    alt = '',
    onSave,
    className = '',
    style = {},
    aspectRatio = 'auto',
    productBackground = null,
    onSaveBackground = null,
}) => {
    const { isAdmin, editMode } = useProducts();
    const [isEditing, setIsEditing] = useState(false);
    const [showBgPanel, setShowBgPanel] = useState(false);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [selectedBg, setSelectedBg] = useState(productBackground || null);
    const [customBgPreview, setCustomBgPreview] = useState(null);
    const fileInputRef = useRef(null);
    const bgInputRef = useRef(null);

    const handleImageClick = () => {
        if (isAdmin && editMode && !isEditing && !showBgPanel) {
            setIsEditing(true);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewSrc(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (previewSrc) {
            await onSave(previewSrc);
        }
        setIsEditing(false);
        setPreviewSrc(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setPreviewSrc(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleBgSelect = (bgUrl) => {
        setSelectedBg(bgUrl);
        setCustomBgPreview(null);
    };

    const handleCustomBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomBgPreview(reader.result);
                setSelectedBg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveBg = async () => {
        if (onSaveBackground) {
            await onSaveBackground(selectedBg);
        }
        setShowBgPanel(false);
    };

    const handleCancelBg = () => {
        setSelectedBg(productBackground || null);
        setCustomBgPreview(null);
        setShowBgPanel(false);
    };

    const displaySrc = previewSrc || src;
    const activeBg = showBgPanel ? selectedBg : productBackground;

    // Wrapper style: if background active, show it as CSS background-image
    const wrapperBgStyle = activeBg
        ? { backgroundImage: `url(${activeBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    if (!isAdmin || !editMode) {
        return (
            <div
                className={`editable-image-wrapper ${className}`}
                style={{ position: 'relative', ...wrapperBgStyle, ...style }}
            >
                <img
                    src={src}
                    alt={alt}
                    className={`editable-image ${className}`}
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        objectFit: 'contain',
                        // If background is active, shrink the shoe slightly to reveal the bg at edges
                        padding: activeBg ? '5%' : '0',
                        background: 'transparent',
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`editable-image-wrapper ${isEditing || showBgPanel ? 'editing' : ''}`}
            style={wrapperBgStyle}
        >
            <img
                src={displaySrc}
                alt={alt}
                className={`editable-image ${className}`}
                style={{
                    position: 'relative',
                    zIndex: 1,
                    objectFit: 'contain',
                    padding: activeBg ? '5%' : '0',
                    background: 'transparent',
                }}
                onClick={handleImageClick}
            />

            {/* Normal edit overlay (when not in bg panel mode) */}
            {!isEditing && !showBgPanel && (
                <div className="image-edit-overlay" onClick={handleImageClick}>
                    <ImageIcon size={32} />
                    <span>Click to change</span>
                </div>
            )}

            {/* Admin action bar (shown when not in editing mode) */}
            {!isEditing && !showBgPanel && (
                <button
                    className="btn-bg-switcher"
                    onClick={(e) => { e.stopPropagation(); setShowBgPanel(true); }}
                    title="Đổi nền ảnh"
                >
                    <Layers size={14} /> Đổi Nền
                </button>
            )}

            {/* Image upload panel */}
            {isEditing && (
                <>
                    <label className="image-upload-zone">
                        <Upload size={32} />
                        <span>Choose new image</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </label>

                    <div className="image-edit-actions">
                        <button
                            className="btn-save-image"
                            onClick={handleSave}
                            disabled={!previewSrc}
                            title="Save image"
                        >
                            <Save size={16} /> Save
                        </button>
                        <button
                            className="btn-cancel-image"
                            onClick={handleCancel}
                            title="Cancel"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </>
            )}

            {/* Background selector panel */}
            {showBgPanel && (
                <div className="bg-selector-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-panel-header">
                        <Layers size={16} /> Chọn Nền Ảnh
                    </div>
                    <div className="bg-presets-grid">
                        {PRESET_BACKGROUNDS.map((bg) => (
                            <div
                                key={bg.id}
                                className={`bg-preset-item ${selectedBg === bg.url ? 'selected' : ''}`}
                                onClick={() => handleBgSelect(bg.url)}
                            >
                                {bg.url ? (
                                    <img src={bg.url} alt={bg.label} />
                                ) : (
                                    <div className="bg-preset-none">✕</div>
                                )}
                                <span>{bg.label}</span>
                            </div>
                        ))}

                        {/* Custom upload option */}
                        <label className={`bg-preset-item bg-preset-custom ${customBgPreview ? 'selected' : ''}`}>
                            {customBgPreview ? (
                                <img src={customBgPreview} alt="Custom" />
                            ) : (
                                <div className="bg-preset-upload-icon">
                                    <Upload size={24} />
                                </div>
                            )}
                            <span>Tải nền của bạn</span>
                            <input
                                ref={bgInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCustomBgUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <div className="bg-panel-actions">
                        <button className="btn-save-image" onClick={handleSaveBg}>
                            <Save size={14} /> Lưu Nền
                        </button>
                        <button className="btn-cancel-image" onClick={handleCancelBg}>
                            <X size={14} /> Hủy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditableImage;
