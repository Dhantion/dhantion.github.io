'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from '../../components/BottomNav';
import { useRide } from '../../context/RideContext';
import { CONTENT } from '../../constants/content';

export default function DriverProfile() {
    const { user, logout } = useAuth();
    const { ride, history, leaderboard } = useRide();
    const router = useRouter();

    useEffect(() => {
        if (!user || user.role !== 'driver') {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div style={containerStyle}>
            <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <h1 style={{ marginBottom: '2rem' }}>Driver Profile 🚕</h1>

                <div style={cardStyle}>
                    <div style={avatarStyle}>{user.name.charAt(0).toUpperCase()}</div>
                    <h2>{user.name}</h2>
                    <p style={{ color: '#aaa' }}>{user.email}</p>
                    <div style={badgeStyle}>DRIVER</div>
                </div>

                <div style={statsContainer}>
                    <div style={statCard}>
                        <h3>TOTAL RIDES</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0', color: '#4facfe' }}>
                            {history.length}
                        </p>
                    </div>
                </div>

                <button onClick={logout} style={logoutBtnStyle}>Logout</button>

                {/* Leaderboard Section */}
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>🏆 Top Performers</h2>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ color: '#ffd700', marginBottom: '1rem', textAlign: 'center' }}>Top Drivers</h3>
                        <div style={leaderboardContainerStyle}>
                            {leaderboard.topDrivers.length === 0 ? <p style={{ textAlign: 'center', color: '#666' }}>No data</p> :
                                leaderboard.topDrivers.map((d, i) => (
                                    <div key={i} style={leaderboardRowStyle}>
                                        <span style={{ color: i === 0 ? '#ffd700' : '#fff', fontWeight: 'bold' }}>#{i + 1} {d.name}</span>
                                        <span style={{ color: '#aaa' }}>{d.count} Rides</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div>
                        <h3 style={{ color: '#d500f9', marginBottom: '1rem', textAlign: 'center' }}>Top Passengers</h3>
                        <div style={leaderboardContainerStyle}>
                            {leaderboard.topPassengers.length === 0 ? <p style={{ textAlign: 'center', color: '#666' }}>No data</p> :
                                leaderboard.topPassengers.map((p, i) => (
                                    <div key={i} style={leaderboardRowStyle}>
                                        <span style={{ color: i === 0 ? '#d500f9' : '#fff', fontWeight: 'bold' }}>#{i + 1} {p.name}</span>
                                        <span style={{ color: '#aaa' }}>{p.count} Rides</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

            </div>
            <BottomNav role="driver" />
        </div>
    );
}

const containerStyle = {
    minHeight: '100vh',
    background: CONTENT.COLORS.passenger_bg, // Unified Theme
    color: '#fff',
    paddingBottom: '80px'
};

const cardStyle = {
    background: '#222',
    padding: '2rem',
    borderRadius: '16px',
    textAlign: 'center' as const,
    border: '1px solid #333',
    marginBottom: '2rem'
};

const avatarStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#4facfe',
    color: '#fff',
    fontSize: '2rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem auto'
};

const badgeStyle = {
    background: 'rgba(79, 172, 254, 0.2)',
    color: '#4facfe',
    padding: '0.3rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '1rem'
};

const logoutBtnStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #ff416c',
    background: 'transparent',
    color: '#ff416c',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
};

const statsContainer = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    marginBottom: '2rem'
};

const statCard = {
    background: '#1a1a1a',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center' as const,
    border: '1px solid #333'
};

const leaderboardContainerStyle = {
    background: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #333',
    overflow: 'hidden'
};

const leaderboardRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid #333'
};
