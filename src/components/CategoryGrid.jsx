import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Edit, Upload, Save, X } from 'lucide-react';
import './CategoryGrid.css';

const CategoryGrid = () => {
    const { categories, isAdmin, editMode, updateCategory } = useProducts();
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

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
    };

    const saveEditing = async () => {
        if (editingId) {
            await updateCategory(editingId, editData);
            setEditingId(null);
            setEditData({});
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData({ ...editData, image: reader.result });
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
                                <img src={editingId === cat.id ? editData.image : cat.image} alt={cat.title} />
                                {isAdmin && editMode && editingId === cat.id && (
                                    <label className="image-upload-overlay">
                                        <Upload size={24} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                            <div className="card-overlay">
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
                                            <button className="btn-save" onClick={saveEditing}>
                                                <Save size={16} /> Lưu
                                            </button>
                                            <button className="btn-cancel" onClick={cancelEditing}>
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

