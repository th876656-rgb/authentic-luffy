import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X, Upload } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    const { heroContent, updateHeroContent, editMode, isAdmin } = useProducts();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState({});
    const [backgroundPreview, setBackgroundPreview] = useState(null);

    useEffect(() => {
        if (heroContent) {
            setEditedContent(heroContent);
        }
    }, [heroContent]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackgroundPreview(reader.result);
                setEditedContent({ ...editedContent, backgroundImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            await updateHeroContent(editedContent);
            setIsEditing(false);
            setBackgroundPreview(null);
        } catch (error) {
            console.error('Failed to save hero content:', error);
            alert('Không thể lưu thay đổi!');
        }
    };

    const handleCancel = () => {
        setEditedContent(heroContent);
        setIsEditing(false);
        setBackgroundPreview(null);
    };

    const backgroundImage = backgroundPreview || heroContent?.backgroundImage ||
        'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80';

    return (
        <section className="hero-section" style={{ backgroundImage: `url(${backgroundImage})` }}>
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
                            <button className="btn-save-hero" onClick={handleSave}>
                                <Save size={18} />
                                Lưu
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
                        <h1 className="hero-title">
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
