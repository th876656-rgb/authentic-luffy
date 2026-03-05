import React, { useState, useRef, useEffect } from 'react';
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

/**
 * Composite shoe image onto a background using Canvas.
 * Removes white/light background from the shoe image.
 */
const createComposite = (shoeSrc, bgSrc) => {
    return new Promise((resolve) => {
        const shoeImg = new Image();
        shoeImg.crossOrigin = 'anonymous';

        shoeImg.onload = () => {
            const bgImg = new Image();
            bgImg.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = shoeImg.naturalWidth;
                canvas.height = shoeImg.naturalHeight;
                const ctx = canvas.getContext('2d');

                // Draw background scaled to shoe image size
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

                // Draw shoe to a temp canvas to get pixel data
                const tmp = document.createElement('canvas');
                tmp.width = shoeImg.naturalWidth;
                tmp.height = shoeImg.naturalHeight;
                const tctx = tmp.getContext('2d');
                tctx.drawImage(shoeImg, 0, 0);

                let imageData;
                try {
                    imageData = tctx.getImageData(0, 0, tmp.width, tmp.height);
                } catch (e) {
                    // CORS issue – just overlay without bg removal
                    ctx.drawImage(shoeImg, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.92));
                    return;
                }

                const d = imageData.data;
                const THRESHOLD = 230; // white-ish threshold
                const FEATHER = 20;    // anti-alias range

                for (let i = 0; i < d.length; i += 4) {
                    const r = d[i], g = d[i + 1], b = d[i + 2];
                    const brightness = (r + g + b) / 3;
                    if (brightness >= THRESHOLD) {
                        d[i + 3] = 0; // fully transparent
                    } else if (brightness >= THRESHOLD - FEATHER) {
                        // Gradual fade at edge
                        const alpha = Math.round(((THRESHOLD - brightness) / FEATHER) * 255);
                        d[i + 3] = alpha;
                    }
                }

                tctx.putImageData(imageData, 0, 0);
                ctx.drawImage(tmp, 0, 0);

                resolve(canvas.toDataURL('image/jpeg', 0.92));
            };
            bgImg.onerror = () => {
                // bg failed – just resolve with shoe as-is
                resolve(shoeSrc);
            };
            bgImg.src = bgSrc;
        };
        shoeImg.onerror = () => resolve(shoeSrc);
        shoeImg.src = shoeSrc;
    });
};

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
    const [compositeSrc, setCompositeSrc] = useState(null);
    const [isCompositing, setIsCompositing] = useState(false);
    const fileInputRef = useRef(null);
    const bgInputRef = useRef(null);

    // Whenever productBackground or src changes, create a composite
    useEffect(() => {
        if (productBackground && src) {
            setIsCompositing(true);
            createComposite(src, productBackground).then(result => {
                setCompositeSrc(result);
                setIsCompositing(false);
            });
        } else {
            setCompositeSrc(null);
        }
    }, [productBackground, src]);

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

    // Display: if a background is active, show the composited canvas image
    const displaySrc = previewSrc || (productBackground ? (compositeSrc || src) : src);

    if (!isAdmin || !editMode) {
        return (
            <div className={`editable-image-wrapper ${className}`} style={{ position: 'relative', ...style }}>
                <img
                    src={displaySrc}
                    alt={alt}
                    className={`editable-image ${className}`}
                    style={{ position: 'relative', zIndex: 1 }}
                />
                {isCompositing && <div className="compositing-overlay">Đang xử lý...</div>}
            </div>
        );
    }

    return (
        <div className={`editable-image-wrapper ${isEditing || showBgPanel ? 'editing' : ''}`}>
            <img
                src={displaySrc}
                alt={alt}
                className={`editable-image ${className}`}
                style={{ position: 'relative', zIndex: 1 }}
                onClick={handleImageClick}
            />

            {isCompositing && <div className="compositing-overlay">⚙️ Đang xử lý nền...</div>}

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
