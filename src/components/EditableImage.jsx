import React, { useState, useRef, useEffect, useCallback } from 'react';
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
 * Edge flood-fill background removal.
 * Only removes pixels connected to the border of the image (the photographic background),
 * preserving interior details like white swoosh, laces, and light-colored shoe areas.
 */
const removeBackgroundFloodFill = (data, width, height, threshold = 238) => {
    const visited = new Uint8Array(width * height);
    const queue = [];

    const isLight = (idx) => {
        const d = idx * 4;
        return data[d] >= threshold && data[d + 1] >= threshold && data[d + 2] >= threshold;
    };

    const enqueue = (x, y) => {
        const idx = y * width + x;
        if (!visited[idx] && isLight(idx)) {
            visited[idx] = 1;
            queue.push(idx);
        }
    };

    // Seed from all 4 edges
    for (let x = 0; x < width; x++) {
        enqueue(x, 0);
        enqueue(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        enqueue(0, y);
        enqueue(width - 1, y);
    }

    // BFS flood fill
    while (queue.length > 0) {
        const idx = queue.pop();
        // Make transparent
        data[idx * 4 + 3] = 0;

        const x = idx % width;
        const y = Math.floor(idx / width);

        if (x > 0) enqueue(x - 1, y);
        if (x < width - 1) enqueue(x + 1, y);
        if (y > 0) enqueue(x, y - 1);
        if (y < height - 1) enqueue(x, y + 1);
    }
};

const createComposite = (shoeSrc, bgSrc) => {
    return new Promise((resolve) => {
        const shoeImg = new Image();
        shoeImg.crossOrigin = 'anonymous';

        shoeImg.onload = () => {
            const W = shoeImg.naturalWidth;
            const H = shoeImg.naturalHeight;

            // Decode shoe pixels
            const tmp = document.createElement('canvas');
            tmp.width = W; tmp.height = H;
            const tctx = tmp.getContext('2d');
            tctx.drawImage(shoeImg, 0, 0);

            let imageData;
            try {
                imageData = tctx.getImageData(0, 0, W, H);
            } catch (e) {
                // CORS blocked – fall back to CSS only approach
                resolve(null);
                return;
            }

            // Remove border-connected background pixels
            removeBackgroundFloodFill(imageData.data, W, H);
            tctx.putImageData(imageData, 0, 0);

            // Now composite on top of background
            const bgImg = new Image();
            bgImg.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = W; canvas.height = H;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(bgImg, 0, 0, W, H);       // background
                ctx.drawImage(tmp, 0, 0);                 // shoe (transparent bg)
                resolve(canvas.toDataURL('image/png'));
            };
            bgImg.onerror = () => {
                resolve(null); // fallback to CSS
            };
            bgImg.src = bgSrc;
        };

        shoeImg.onerror = () => resolve(null);
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

    // When background or src changes, try to composite
    useEffect(() => {
        if (productBackground && src) {
            setIsCompositing(true);
            createComposite(src, productBackground).then((result) => {
                setCompositeSrc(result);
                setIsCompositing(false);
            });
        } else {
            setCompositeSrc(null);
        }
    }, [productBackground, src]);

    const activeBg = showBgPanel ? selectedBg : productBackground;
    // If compositing succeeded, show it; else fall back to CSS background approach
    const fallbackBgStyle = activeBg && !compositeSrc
        ? { backgroundImage: `url(${activeBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const displaySrc = previewSrc || (compositeSrc || src);

    const handleImageClick = () => {
        if (isAdmin && editMode && !isEditing && !showBgPanel) {
            setIsEditing(true);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewSrc(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (previewSrc) await onSave(previewSrc);
        setIsEditing(false);
        setPreviewSrc(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setPreviewSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
        if (onSaveBackground) await onSaveBackground(selectedBg);
        setShowBgPanel(false);
    };

    const handleCancelBg = () => {
        setSelectedBg(productBackground || null);
        setCustomBgPreview(null);
        setShowBgPanel(false);
    };

    if (!isAdmin || !editMode) {
        return (
            <div className={`editable-image-wrapper ${className}`} style={{ position: 'relative', ...fallbackBgStyle, ...style }}>
                {isCompositing && <div className="compositing-overlay">⚙️ Đang xử lý...</div>}
                <img
                    src={displaySrc}
                    alt={alt}
                    className={`editable-image ${className}`}
                    style={{ position: 'relative', zIndex: 1 }}
                />
            </div>
        );
    }

    return (
        <div className={`editable-image-wrapper ${isEditing || showBgPanel ? 'editing' : ''}`} style={fallbackBgStyle}>
            {isCompositing && <div className="compositing-overlay">⚙️ Đang xử lý nền...</div>}
            <img
                src={displaySrc}
                alt={alt}
                className={`editable-image ${className}`}
                style={{ position: 'relative', zIndex: 1 }}
                onClick={handleImageClick}
            />

            {!isEditing && !showBgPanel && (
                <div className="image-edit-overlay" onClick={handleImageClick}>
                    <ImageIcon size={32} />
                    <span>Click to change</span>
                </div>
            )}

            {!isEditing && !showBgPanel && (
                <button
                    className="btn-bg-switcher"
                    onClick={(e) => { e.stopPropagation(); setShowBgPanel(true); }}
                    title="Đổi nền ảnh"
                >
                    <Layers size={14} /> Đổi Nền
                </button>
            )}

            {isEditing && (
                <>
                    <label className="image-upload-zone">
                        <Upload size={32} />
                        <span>Choose new image</span>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </label>
                    <div className="image-edit-actions">
                        <button className="btn-save-image" onClick={handleSave} disabled={!previewSrc}>
                            <Save size={16} /> Save
                        </button>
                        <button className="btn-cancel-image" onClick={handleCancel}>
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </>
            )}

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
                                {bg.url ? <img src={bg.url} alt={bg.label} /> : <div className="bg-preset-none">✕</div>}
                                <span>{bg.label}</span>
                            </div>
                        ))}
                        <label className={`bg-preset-item bg-preset-custom ${customBgPreview ? 'selected' : ''}`}>
                            {customBgPreview
                                ? <img src={customBgPreview} alt="Custom" />
                                : <div className="bg-preset-upload-icon"><Upload size={24} /></div>
                            }
                            <span>Tải nền của bạn</span>
                            <input ref={bgInputRef} type="file" accept="image/*" onChange={handleCustomBgUpload} style={{ display: 'none' }} />
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
