import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Edit, LogOut, Key, Package, TrendingUp, Download, Upload } from 'lucide-react';
import db from '../utils/db';
import './Admin.css';

const Admin = () => {
    const { isAdmin, logout, editMode, toggleEditMode, products, changePassword } = useProducts();
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    if (!isAdmin) {
        navigate('/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới không khớp!');
            return;
        }
        if (changePassword(oldPassword, newPassword)) {
            alert('Đổi mật khẩu thành công!');
            setShowPasswordModal(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            alert('Mật khẩu cũ không đúng!');
        }
    };



    const handleBackup = async () => {
        try {
            const data = {
                products: await db.getAll('products'),
                categories: await db.getAll('categories'),
                settings: await db.getAll('settings'),
                hero: await db.getAll('hero'),
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `authentic_luffy_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Backup failed:', error);
            alert('Sao lưu thất bại!');
        }
    };

    const handleInitDB = async () => {
        try {
            alert('Đang khởi tạo database... Vui lòng đợi.');

            // Force initialize database
            await db.init();
            await db.initializeDefaultData();

            // Test all stores
            await db.getAll('products');
            await db.getAll('categories');
            await db.getAll('settings');
            await db.getAll('hero');

            alert('✅ Database đã sẵn sàng! Bây giờ bạn có thể Khôi Phục dữ liệu.');
        } catch (error) {
            console.error('Init DB failed:', error);
            alert(`❌ Khởi tạo thất bại: ${error.message}`);
        }
    };

    const handleRestore = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!window.confirm('CẢNH BÁO: Khôi phục sẽ XÓA toàn bộ dữ liệu hiện tại và thay thế bằng dữ liệu trong file backup. Bạn có chắc chắn không?')) {
            e.target.value = '';
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    // Clear and restore each store
                    if (data.products) {
                        await db.clearStore('products');
                        for (const product of data.products) {
                            await db.add('products', product);
                        }
                    }

                    if (data.categories) {
                        await db.clearStore('categories');
                        for (const category of data.categories) {
                            await db.add('categories', category);
                        }
                    }

                    if (data.settings) {
                        await db.clearStore('settings');
                        for (const setting of data.settings) {
                            await db.add('settings', setting);
                        }
                    }

                    if (data.hero) {
                        await db.clearStore('hero');
                        for (const item of data.hero) {
                            await db.add('hero', item);
                        }
                    }

                    alert('Khôi phục dữ liệu thành công! Trang web sẽ tải lại.');
                    window.location.reload();
                } catch (err) {
                    console.error('Restore failed:', err);
                    alert('File backup không hợp lệ!');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Khôi phục thất bại!');
        }
        e.target.value = '';
    };

    const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 3);
    const soldOutProducts = products.filter(p => p.quantity === 0);

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Dashboard Quản Trị</h1>
                <div className="admin-actions">
                    <button
                        className={`btn-edit-mode ${editMode ? 'active' : ''}`}
                        onClick={toggleEditMode}
                    >
                        <Edit size={18} />
                        {editMode ? 'Tắt Chế Độ Chỉnh Sửa' : 'Bật Chế Độ Chỉnh Sửa'}
                    </button>
                    <button
                        className="btn-change-password"
                        onClick={() => setShowPasswordModal(true)}
                    >
                        <Key size={18} />
                        Đổi Mật Khẩu
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        Thoát
                    </button>
                </div>
            </div>

            <div className="admin-stats">
                <div className="stat-card">
                    <Package size={32} />
                    <div className="stat-info">
                        <h3>{products.length}</h3>
                        <p>Tổng Sản Phẩm</p>
                    </div>
                </div>
                <div className="stat-card warning">
                    <TrendingUp size={32} />
                    <div className="stat-info">
                        <h3>{lowStockProducts.length}</h3>
                        <p>Sắp Hết Hàng</p>
                    </div>
                </div>
                <div className="stat-card danger">
                    <Package size={32} />
                    <div className="stat-info">
                        <h3>{soldOutProducts.length}</h3>
                        <p>Đã Hết Hàng</p>
                    </div>
                </div>
            </div>

            <div className="admin-content">
                <div className="admin-card">
                    <h3>Chỉnh Sửa Trang Chủ</h3>
                    <p>Bật chế độ chỉnh sửa để cập nhật nội dung, hình ảnh trực tiếp trên trang chủ.</p>
                    <button
                        className="admin-action-btn"
                        onClick={() => {
                            toggleEditMode();
                            navigate('/');
                        }}
                    >
                        Đến Trang Chủ
                    </button>
                </div>

                <div className="admin-card">
                    <h3>Quản Lý Sản Phẩm</h3>
                    <p>Thêm, sửa, xóa sản phẩm và cập nhật giá, số lượng.</p>
                    <button
                        className="admin-action-btn"
                        onClick={() => navigate('/category/daily')}
                    >
                        Quản Lý Sản Phẩm
                    </button>
                </div>

                <div className="admin-card">
                    <h3>Danh Mục</h3>
                    <p>Quản lý các danh mục sản phẩm và hình ảnh.</p>
                    <button
                        className="admin-action-btn"
                        onClick={() => navigate('/')}
                    >
                        Xem Danh Mục
                    </button>
                </div>

                <div className="admin-card">
                    <h3>Sao Lưu & Khôi Phục</h3>
                    <p>Tải xuống dữ liệu hiện tại hoặc khôi phục từ file backup.</p>
                    <div className="backup-actions">
                        <button className="admin-action-btn btn-backup" onClick={handleBackup}>
                            <Download size={16} /> Sao Lưu
                        </button>
                        <label className="admin-action-btn btn-restore">
                            <Upload size={16} /> Khôi Phục
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleRestore}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>

                <div className="admin-card">
                    <h3>Cài Đặt Chân Trang</h3>
                    <p>Chỉnh sửa thông tin liên hệ, địa chỉ và copyright.</p>
                    <button
                        className="admin-action-btn"
                        onClick={() => {
                            toggleEditMode();
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            navigate('/');
                        }}
                    >
                        Chỉnh Sửa Footer
                    </button>
                </div>
            </div>

            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Đổi Mật Khẩu</h2>
                        <form onSubmit={handleChangePassword}>
                            <input
                                type="password"
                                placeholder="Mật khẩu cũ"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Xác nhận mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <div className="modal-actions">
                                <button type="submit" className="btn-save">Lưu</button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
