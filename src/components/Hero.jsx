import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X, Upload } from 'lucide-react';
import { supabase } from '../utils/supabase';
import './Hero.css';

const Hero = () => {
    const { heroContent, updateHeroContent, editMode, isAdmin } = useProducts();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState({});
    const [backgroundPreview, setBackgroundPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (heroContent) {
            setEditedContent(heroContent);
        }
    }, [heroContent]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackgroundPreview(reader.result);
                // We keep the preview for UI, but don't set base64 to editedContent yet
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            let finalImageUrl = editedContent.backgroundImage || heroContent?.backgroundImage;

            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `hero_${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                finalImageUrl = publicUrl;
            }

            const finalContent = { ...editedContent, backgroundImage: finalImageUrl };
            await updateHeroContent(finalContent);

            setIsEditing(false);
            setBackgroundPreview(null);
            setSelectedFile(null);
            alert('Đổi ảnh nền thành công!');
        } catch (error) {
            console.error('Failed to save hero content:', error);
            alert('Không thể lưu thay đổi! Chi tiết lỗi: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedContent(heroContent);
        setIsEditing(false);
        setBackgroundPreview(null);
        setSelectedFile(null);
    };

    const backgroundImage = backgroundPreview || heroContent?.backgroundImage ||
        'https://ayanxbiavxwouaexrywf.supabase.co/storage/v1/object/public/products/hero_1772684427270.png';

    return (
        <section className="hero-section" style={{ '--hero-bg': `url("${backgroundImage}")` }}>
            <div className="hero-overlay"></div>
            <div className="container hero-content">
                {isAdmin && editMode && !isEditing && (
                    <button className="edit-hero-btn" onClick={() => setIsEditing(true)}>
                        <Edit2 size={20} />
                        Chỉnh Sửa
                    </button>
                )}

                {isEditing ? (
                    <div className="hero-editor">
                        <div className="editor-controls">
                            <button className="btn-save-hero" onClick={handleSave} disabled={isSaving}>
                                <Save size={18} />
                                {isSaving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button className="btn-cancel-hero" onClick={handleCancel}>
                                <X size={18} />
                                Hủy
                            </button>
                        </div>

                        <div className="image-upload-section">
                            <label htmlFor="hero-bg-upload" className="upload-label">
                                <Upload size={20} />
                                Đổi Ảnh Nền
                            </label>
                            <input
                                id="hero-bg-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="style-toggles">
                            <label className="color-picker-label">
                                Màu Hiệu Ứng:
                                <input
                                    type="color"
                                    className="color-input"
                                    value={editedContent.titleColor || '#ffffff'}
                                    onChange={(e) => setEditedContent({ ...editedContent, titleColor: e.target.value })}
                                />
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={editedContent.isFuturistic || false}
                                    onChange={(e) => setEditedContent({ ...editedContent, isFuturistic: e.target.checked })}
                                />
                                Chữ nổi 3D (Phát sáng)
                            </label>
                        </div>

                        <input
                            type="text"
                            className="edit-input badge-input"
                            value={editedContent.badge || ''}
                            onChange={(e) => setEditedContent({ ...editedContent, badge: e.target.value })}
                            placeholder="Badge text"
                        />

                        <input
                            type="text"
                            className="edit-input title-input"
                            value={editedContent.title1 || ''}
                            onChange={(e) => setEditedContent({ ...editedContent, title1: e.target.value })}
                            placeholder="Title line 1"
                        />

                        <input
                            type="text"
                            className="edit-input title-input"
                            value={editedContent.title2 || ''}
                            onChange={(e) => setEditedContent({ ...editedContent, title2: e.target.value })}
                            placeholder="Title line 2"
                        />

                        <input
                            type="text"
                            className="edit-input subtitle-input"
                            value={editedContent.subtitle || ''}
                            onChange={(e) => setEditedContent({ ...editedContent, subtitle: e.target.value })}
                            placeholder="Subtitle"
                        />

                        <input
                            type="text"
                            className="edit-input button-input"
                            value={editedContent.buttonText || ''}
                            onChange={(e) => setEditedContent({ ...editedContent, buttonText: e.target.value })}
                            placeholder="Button text"
                        />
                    </div>
                ) : (
                    <>
                        <div className="hero-badge">{heroContent?.badge || 'CẬP NHẬT HÀNG MỚI HÔM NAY'}</div>
                        <h1
                            className={`hero-title ${heroContent?.isFuturistic ? 'futuristic' : ''}`}
                            style={{ '--theme-color': heroContent?.titleColor || '#ffffff' }}
                        >
                            <span className="text-stroke">{heroContent?.title1 || 'AUTHENTIC'}</span><br />
                            <span className="text-filled">{heroContent?.title2 || 'LUFFY'}</span>
                        </h1>
                        <p className="hero-subtitle">{heroContent?.subtitle || 'SĂN DEAL - HÀNG HIỆU - GIÁ TỐT'}</p>
                        <button
                            className="cta-button"
                            onClick={() => navigate('/new-arrivals')}
                        >
                            {heroContent?.buttonText || 'KHÁM PHÁ NGAY'}
                        </button>
                    </>
                )}
            </div>

            {/* Decorative Elements */}
            <div className="digital-noise"></div>
        </section>
    );
};

export default Hero;
