import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import './Login.css';

const Login = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useProducts();

    const handleLogin = (e) => {
        e.preventDefault();
        if (login(password)) {
            navigate('/admin');
        } else {
            alert('Mật khẩu không đúng!');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Đăng Nhập Admin</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-login">Đăng Nhập</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
