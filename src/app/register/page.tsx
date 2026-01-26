'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
    const { register, user } = useAuth();
    const router = useRouter(); // Use router
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
    const [error, setError] = useState('');

    // Redirect if already logged in (which happens after successful register)
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') router.push('/admin');
            else if (user.role === 'driver') router.push('/driver');
            else router.push('/passenger');
        }
    }, [user, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (name && email && password) {
            try {
                await register(name, email, password, role);
                // Redirect handled by useEffect
            } catch (err: any) {
                console.error(err);
                if (err.code === 'auth/email-already-in-use') {
                    setError('Bu email adresi zaten kullanımda.');
                } else if (err.code === 'auth/weak-password') {
                    setError('Şifre çok zayıf (en az 6 karakter).');
                } else {
                    setError('Kayıt başarısız. Lütfen tekrar deneyin.');
                }
            }
        }
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#00f2fe' }}>BilStop</h1>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>Create your account</p>

            <form onSubmit={handleRegister} style={cardStyle}>
                {error && (
                    <div style={{ background: 'rgba(255, 65, 108, 0.2)', color: '#ff416c', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ff416c', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Full Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Ahmet Yılmaz"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Email Address</label>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>I want to be a...</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setRole('passenger')}
                            style={role === 'passenger' ? activeRoleBtn : roleBtn}
                        >
                            Passenger
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('driver')}
                            style={role === 'driver' ? activeRoleBtn : roleBtn}
                        >
                            Driver
                        </button>
                    </div>
                </div>

                <button type="submit" style={submitBtnStyle}>Register</button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
                    Already have an account? <Link href="/login" style={{ color: '#4facfe' }}>Log in</Link>
                </p>
            </form>
        </div>
    );
}

// Styles
const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#fff',
    textAlign: 'center' as const
};

const cardStyle = {
    background: '#222',
    padding: '2rem',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #333',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
};

const inputGroupStyle = {
    marginBottom: '1rem',
    textAlign: 'left' as const
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#aaa',
    fontSize: '0.9rem'
};

const inputStyle = {
    width: '100%',
    padding: '0.8rem',
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
    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem'
};

const roleBtn = {
    flex: 1,
    padding: '0.8rem',
    borderRadius: '8px',
    border: '1px solid #444',
    background: 'transparent',
    color: '#aaa',
    cursor: 'pointer'
};

const activeRoleBtn = {
    ...roleBtn,
    borderColor: '#00f2fe',
    color: '#00f2fe',
    background: 'rgba(0, 242, 254, 0.1)'
};
