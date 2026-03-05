import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Edit, Upload, Save, X } from 'lucide-react';
import { supabase } from '../utils/supabase';
import OptimizedImage from './OptimizedImage';
import './CategoryGrid.css';

const CategoryGrid = () => {
    const { categories, isAdmin, editMode, updateCategory } = useProducts();
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleCategoryClick = (categoryId) => {
        if (!editMode) {
            navigate(`/category/${categoryId}`);
        }
    };

    const startEditing = (cat) => {
        setEditingId(cat.id);
        setEditData({ title: cat.title, subtitle: cat.subtitle, image: cat.image });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditData({});
        setSelectedFile(null);
    };

    const saveEditing = async () => {
        if (editingId) {
            try {
                setIsSaving(true);
                let finalImageUrl = editData.image;

                if (selectedFile) {
                    const fileExt = selectedFile.name.split('.').pop();
                    const fileName = `category_${editingId}_${Date.now()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(fileName, selectedFile, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('products')
                        .getPublicUrl(fileName);

                    finalImageUrl = publicUrl;
                }

                await updateCategory(editingId, { ...editData, image: finalImageUrl });
                setEditingId(null);
                setEditData({});
                setSelectedFile(null);
            } catch (error) {
                console.error('Failed to save category:', error);
                alert('Không thể lưu thay đổi danh mục! Lỗi: ' + (error.message || 'Chưa rõ nguyên nhân'));
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData({ ...editData, image: reader.result }); // Temporary preview
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className="category-section">
            <div className="container">
                <h2 className="section-title">DANH MỤC NỔI BẬT</h2>
                <div className="category-grid">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`category-card ${editMode ? 'edit-mode' : ''}`}
                            onClick={() => handleCategoryClick(cat.id)}
                        >
                            <div className="card-image">
                                <OptimizedImage
                                    src={editingId === cat.id ? editData.image : cat.image}
                                    alt={cat.title}
                                    priority={true}
                                />
                                {isAdmin && editMode && editingId === cat.id && (
                                    <label className="image-upload-overlay" style={{ cursor: 'pointer', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: 'white', zIndex: 10 }}>
                                        <Upload size={32} />
                                        <span>Đổi Ảnh</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                            <div className="card-overlay" style={{ zIndex: 5 }}>
                                {editingId === cat.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                            className="edit-input title-input"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <input
                                            type="text"
                                            value={editData.subtitle}
                                            onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                                            className="edit-input subtitle-input"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="edit-actions" onClick={(e) => e.stopPropagation()}>
                                            <button className="btn-save" onClick={saveEditing} disabled={isSaving}>
                                                <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                                            </button>
                                            <button className="btn-cancel" onClick={cancelEditing} disabled={isSaving}>
                                                <X size={16} /> Hủy
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3>{cat.title}</h3>
                                        <p>{cat.subtitle}</p>
                                        <button className="btn-link">XEM NGAY &rarr;</button>
                                        {isAdmin && editMode && (
                                            <button
                                                className="btn-edit-category"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(cat);
                                                }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;

