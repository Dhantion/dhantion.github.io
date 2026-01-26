'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const { login, user } = useAuth(); // Get user to check status
    const router = useRouter(); // Use router
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') router.push('/admin');
            else if (user.role === 'driver') router.push('/driver');
            else router.push('/passenger');
        }
    }, [user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (email && password) {
            try {
                await login(email, password);
            } catch (err: any) {
                console.error(err);
                if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                    setError('Hatalı email veya şifre.');
                } else if (err.code === 'auth/too-many-requests') {
                    setError('Çok fazla başarısız deneme. Lütfen biraz bekleyin.');
                } else {
                    setError('Giriş başarısız. Lütfen tekrar deneyin.');
                }
            }
        }
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#FFD700' }}>BilStop</h1>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>Hitchhiking app for Bilkenters</p>

            <form onSubmit={handleLogin} style={cardStyle}>
                {error && (
                    <div style={{ background: 'rgba(255, 65, 108, 0.2)', color: '#ff416c', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ff416c', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                    <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Email</label>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <button type="submit" style={submitBtnStyle}>
                    Sign In
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
                    Don't have an account? <Link href="/register" style={{ color: '#F09819' }}>Register</Link>
                </p>


            </form>
        </div>
    );
}

const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#fff',
    textAlign: 'center' as const,
    background: 'linear-gradient(180deg, #000000 0%, #a33b04 100%)'
};

const cardStyle = {
    background: '#222',
    padding: '2.5rem',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #333',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
};

const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#333',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
};

const submitBtnStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(to right, #FF512F 0%, #F09819 100%)',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.1s',
};
