import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Facebook } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import EditableText from './EditableText';
import db from '../utils/db';
import './Footer.css';

const Footer = () => {
    const { isAdmin, editMode } = useProducts();
    const [footerData, setFooterData] = useState({
        address: '125 Lâm Du, Long Biên, Hà Nội',
        phone: '0868.653.931',
        fbPageUrl: 'https://www.facebook.com/chuyenchinhhang',
        copyright: '© 2026 Authentic Luffy. All rights reserved.'
    });

    const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.4737874542435!2d105.89472731476286!3d21.053731785991654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135a903e8e6e3e7%3A0x3e7e8e8e8e8e8e8e!2zMTI1IEzDom0gRHUsIEzDom0gRHUsIExvbmcgQmnDqm4sIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s';

    useEffect(() => {
        loadFooterData();
    }, []);

    const loadFooterData = async () => {
        try {
            // Ensure database is initialized
            if (!db.db) {
                await db.init();
            }
            const saved = await db.get('settings', 'footer');
            if (saved && saved.data) {
                setFooterData(saved.data);
            }
        } catch (error) {
            console.error('Failed to load footer data:', error);
            // Use default values if loading fails
        }
    };

    const saveFooterData = async (newData) => {
        try {
            // Ensure database is initialized
            if (!db.db) {
                await db.init();
            }
            await db.update('settings', { key: 'footer', data: newData });
            setFooterData(newData);
        } catch (error) {
            console.error('Failed to save footer data:', error);
        }
    };

    const handleSaveAddress = async (newValue) => {
        const newData = { ...footerData, address: newValue };
        await saveFooterData(newData);
    };

    const handleSavePhone = async (newValue) => {
        const newData = { ...footerData, phone: newValue };
        await saveFooterData(newData);
    };

    const handleSaveCopyright = async (newValue) => {
        const newData = { ...footerData, copyright: newValue };
        await saveFooterData(newData);
    };

    return (
        <footer className="footer-section">
            <div className="container">
                <div className="footer-grid">
                    {/* Info Section */}
                    <div className="footer-col">
                        <h3 className="footer-title">AUTHENTIC LUFFY</h3>
                        <ul className="footer-info">
                            <li>
                                <MapPin size={16} className="footer-icon" />
                                <EditableText
                                    value={footerData.address}
                                    onSave={handleSaveAddress}
                                    tag="span"
                                />
                            </li>
                            <li>
                                <Phone size={16} className="footer-icon" />
                                <EditableText
                                    value={footerData.phone}
                                    onSave={handleSavePhone}
                                    tag="span"
                                />
                            </li>
                        </ul>
                        <div className="social-links">
                            <a
                                href={footerData.fbPageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                                aria-label="Facebook Page"
                            >
                                <Facebook size={24} />
                            </a>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="footer-col map-col">
                        <h3 className="footer-title">BẢN ĐỒ</h3>
                        <div className="map-container">
                            <iframe
                                src={mapEmbedUrl}
                                width="100%"
                                height="200"
                                style={{ border: 0, borderRadius: '8px' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Store Location"
                            ></iframe>
                        </div>
                    </div>

                    {/* Policy Section */}
                    <div className="footer-col">
                        <h3 className="footer-title">CHÍNH SÁCH</h3>
                        <ul className="footer-links">
                            <li><Link to="/policy/return">Chính sách đổi trả</Link></li>
                            <li><Link to="/policy/guide">Hướng dẫn mua hàng</Link></li>
                            <li><Link to="/policy/privacy">Bảo mật thông tin</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <EditableText
                        value={footerData.copyright}
                        onSave={handleSaveCopyright}
                        tag="p"
                    />
                </div>
            </div>
        </footer>
    );
};

export default Footer;

