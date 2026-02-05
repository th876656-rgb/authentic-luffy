import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import EditableText from './EditableText';
import db from '../utils/db';
import './TrustSignals.css';

const TrustSignals = () => {
    const { isAdmin, editMode } = useProducts();
    const [trustData, setTrustData] = useState({
        signal1Title: 'HÀNG CHÍNH HÃNG 100%',
        signal1Desc: 'Cam kết Authentic trọn đời',
        signal2Title: 'GIAO HÀNG TOÀN QUỐC',
        signal2Desc: 'Nhận hàng trong 2-4 ngày'
    });

    useEffect(() => {
        loadTrustData();
    }, []);

    const loadTrustData = async () => {
        try {
            if (!db.db) {
                await db.init();
            }
            const savedData = await db.getSetting('trustSignals');
            if (savedData) {
                setTrustData(savedData);
            }
        } catch (error) {
            console.error('Failed to load trust signals:', error);
        }
    };

    const saveTrustData = async (newData) => {
        try {
            if (!db.db) {
                await db.init();
            }
            await db.updateSetting('trustSignals', newData);
            setTrustData(newData);
        } catch (error) {
            console.error('Failed to save trust signals:', error);
        }
    };

    const handleSaveSignal1Title = async (newValue) => {
        const newData = { ...trustData, signal1Title: newValue };
        await saveTrustData(newData);
    };

    const handleSaveSignal1Desc = async (newValue) => {
        const newData = { ...trustData, signal1Desc: newValue };
        await saveTrustData(newData);
    };

    const handleSaveSignal2Title = async (newValue) => {
        const newData = { ...trustData, signal2Title: newValue };
        await saveTrustData(newData);
    };

    const handleSaveSignal2Desc = async (newValue) => {
        const newData = { ...trustData, signal2Desc: newValue };
        await saveTrustData(newData);
    };

    return (
        <section className="trust-signals">
            <div className="container trust-container">
                <div className="signal-item">
                    <ShieldCheck size={32} className="signal-icon" />
                    <div className="signal-text">
                        <EditableText
                            value={trustData.signal1Title}
                            onSave={handleSaveSignal1Title}
                            tag="h4"
                            isEditable={isAdmin && editMode}
                        />
                        <EditableText
                            value={trustData.signal1Desc}
                            onSave={handleSaveSignal1Desc}
                            tag="p"
                            isEditable={isAdmin && editMode}
                        />
                    </div>
                </div>
                <div className="divider"></div>
                <div className="signal-item">
                    <Truck size={32} className="signal-icon" />
                    <div className="signal-text">
                        <EditableText
                            value={trustData.signal2Title}
                            onSave={handleSaveSignal2Title}
                            tag="h4"
                            isEditable={isAdmin && editMode}
                        />
                        <EditableText
                            value={trustData.signal2Desc}
                            onSave={handleSaveSignal2Desc}
                            tag="p"
                            isEditable={isAdmin && editMode}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustSignals;
