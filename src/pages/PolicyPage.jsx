import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import './PolicyPage.css';

const defaultPolicyContent = {
    return: {
        title: 'Chính Sách Đổi Trả',
        sections: [
            {
                heading: 'Điều kiện đổi trả',
                content: [
                    'Sản phẩm còn nguyên tem, mác, chưa qua sử dụng',
                    'Sản phẩm không bị dơ bẩn, hư hỏng do người mua',
                    'Đầy đủ hóa đơn, phụ kiện kèm theo (nếu có)',
                    'Thời gian đổi trả trong vòng 7 ngày kể từ ngày nhận hàng'
                ]
            },
            {
                heading: 'Quy trình đổi trả',
                content: [
                    'Liên hệ với chúng tôi qua Messenger hoặc hotline: 0868.653.931',
                    'Cung cấp thông tin đơn hàng và lý do đổi trả',
                    'Gửi sản phẩm về địa chỉ: 125 Lâm Du, Long Biên, Hà Nội',
                    'Nhận sản phẩm mới hoặc hoàn tiền trong vòng 3-5 ngày làm việc'
                ]
            },
            {
                heading: 'Bảo hành sản phẩm',
                content: [
                    'Tất cả sản phẩm đều được bảo hành chính hãng',
                    'Thời gian bảo hành: 6 tháng đối với lỗi nhà sản xuất',
                    'Miễn phí vệ sinh, bảo dưỡng trong thời gian bảo hành',
                    'Hỗ trợ kiểm tra, xác thực sản phẩm authentic trọn đời'
                ]
            }
        ]
    },
    guide: {
        title: 'Hướng Dẫn Mua Hàng',
        sections: [
            {
                heading: 'Cách đặt hàng',
                content: [
                    'Tìm kiếm sản phẩm bằng tên hoặc mã SKU',
                    'Xem chi tiết sản phẩm, chọn size phù hợp',
                    'Nhấn "Liên hệ qua Messenger" để đặt hàng',
                    'Cung cấp thông tin: Họ tên, SĐT, địa chỉ nhận hàng'
                ]
            },
            {
                heading: 'Phương thức thanh toán',
                content: [
                    'Thanh toán khi nhận hàng (COD)',
                    'Chuyển khoản ngân hàng',
                    'Ví điện tử: Momo, ZaloPay',
                    'Quét mã QR thanh toán'
                ]
            },
            {
                heading: 'Vận chuyển',
                content: [
                    'Giao hàng toàn quốc',
                    'Miễn phí ship nội thành Hà Nội (đơn > 500k)',
                    'Thời gian giao hàng: 1-3 ngày (nội thành), 3-7 ngày (tỉnh)',
                    'Kiểm tra hàng trước khi thanh toán'
                ]
            }
        ]
    },
    privacy: {
        title: 'Bảo Mật Thông Tin',
        sections: [
            {
                heading: 'Thu thập thông tin',
                content: [
                    'Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng',
                    'Thông tin bao gồm: Họ tên, SĐT, địa chỉ giao hàng',
                    'Không thu thập thông tin thẻ tín dụng',
                    'Thông tin được mã hóa và bảo mật tuyệt đối'
                ]
            },
            {
                heading: 'Sử dụng thông tin',
                content: [
                    'Xử lý và giao hàng đơn hàng',
                    'Liên hệ xác nhận đơn hàng',
                    'Gửi thông báo về chương trình khuyến mãi (nếu đồng ý)',
                    'Không chia sẻ thông tin cho bên thứ ba'
                ]
            },
            {
                heading: 'Quyền của khách hàng',
                content: [
                    'Yêu cầu xem, sửa đổi thông tin cá nhân',
                    'Yêu cầu xóa thông tin khỏi hệ thống',
                    'Từ chối nhận email marketing',
                    'Liên hệ: 0868.653.931 để được hỗ trợ'
                ]
            }
        ]
    }
};

const PolicyPage = ({ type }) => {
    const { isAdmin, editMode } = useProducts();
    const [policyData, setPolicyData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        loadPolicyData();
    }, [type]);

    const loadPolicyData = async () => {
        try {
            // Try to load from localStorage
            const savedKey = `policy_${type}`;
            const saved = localStorage.getItem(savedKey);

            if (saved) {
                const parsedData = JSON.parse(saved);
                setPolicyData(parsedData);
                setEditData(parsedData);
            } else {
                const defaultData = defaultPolicyContent[type];
                setPolicyData(defaultData);
                setEditData(defaultData);
            }
        } catch (error) {
            console.error('Failed to load policy:', error);
            const defaultData = defaultPolicyContent[type];
            setPolicyData(defaultData);
            setEditData(defaultData);
        }
    };

    const handleSave = async () => {
        try {
            // Save to localStorage
            const savedKey = `policy_${type}`;
            localStorage.setItem(savedKey, JSON.stringify(editData));
            setPolicyData(editData);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save policy:', error);
            alert('Không thể lưu chính sách!');
        }
    };

    const handleCancel = () => {
        setEditData(policyData);
        setIsEditing(false);
    };

    const updateSectionHeading = (sectionIndex, value) => {
        const newData = { ...editData };
        newData.sections[sectionIndex].heading = value;
        setEditData(newData);
    };

    const updateContentItem = (sectionIndex, itemIndex, value) => {
        const newData = { ...editData };
        newData.sections[sectionIndex].content[itemIndex] = value;
        setEditData(newData);
    };

    const addContentItem = (sectionIndex) => {
        const newData = { ...editData };
        newData.sections[sectionIndex].content.push('Nội dung mới');
        setEditData(newData);
    };

    const deleteContentItem = (sectionIndex, itemIndex) => {
        const newData = { ...editData };
        newData.sections[sectionIndex].content.splice(itemIndex, 1);
        setEditData(newData);
    };

    if (!policyData) {
        return <div className="policy-page"><div className="container">Đang tải...</div></div>;
    }

    return (
        <div className="policy-page">
            <div className="container">
                <div className="policy-header">
                    <h1>{policyData.title}</h1>
                    <Link to="/" className="back-link">← Về Trang Chủ</Link>
                    {isAdmin && editMode && !isEditing && (
                        <button className="btn-edit-policy" onClick={() => setIsEditing(true)}>
                            <Edit size={20} /> Chỉnh Sửa
                        </button>
                    )}
                    {isEditing && (
                        <div className="edit-controls">
                            <button className="btn-save-policy" onClick={handleSave}>
                                <Save size={20} /> Lưu
                            </button>
                            <button className="btn-cancel-policy" onClick={handleCancel}>
                                <X size={20} /> Hủy
                            </button>
                        </div>
                    )}
                </div>

                <div className="policy-content">
                    {(isEditing ? editData : policyData).sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="policy-section">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={section.heading}
                                    onChange={(e) => updateSectionHeading(sectionIndex, e.target.value)}
                                    className="edit-heading"
                                />
                            ) : (
                                <h2>{section.heading}</h2>
                            )}
                            <ul>
                                {section.content.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        {isEditing ? (
                                            <div className="edit-item-row">
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => updateContentItem(sectionIndex, itemIndex, e.target.value)}
                                                    className="edit-content-item"
                                                />
                                                <button
                                                    className="btn-delete-item"
                                                    onClick={() => deleteContentItem(sectionIndex, itemIndex)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            item
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {isEditing && (
                                <button
                                    className="btn-add-item"
                                    onClick={() => addContentItem(sectionIndex)}
                                >
                                    <Plus size={16} /> Thêm mục
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="policy-contact">
                    <h3>Cần hỗ trợ thêm?</h3>
                    <p>Liên hệ với chúng tôi:</p>
                    <div className="contact-info">
                        <div>📞 Hotline: 0868.653.931</div>
                        <div>📍 Địa chỉ: 125 Lâm Du, Long Biên, Hà Nội</div>
                        <div>💬 Facebook: <a href="https://www.facebook.com/chuyenchinhhang" target="_blank" rel="noopener noreferrer">Authentic Luffy</a></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
