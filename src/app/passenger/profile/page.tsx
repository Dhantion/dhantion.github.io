'use client';

import { useAuth } from '../../context/AuthContext';
import BottomNav from '../../components/BottomNav';
import { useRide } from '../../context/RideContext';
import { CONTENT } from '../../constants/content';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { history, leaderboard } = useRide();

    if (!user) return null;

    return (
        <div style={containerStyle}>
            <h1 style={{ marginBottom: '2rem', color: '#4facfe' }}>My Profile</h1>

            <div style={cardStyle}>
                <div style={avatarCircle}>
                    {user.name.charAt(0).toUpperCase()}
                </div>

                <h2 style={{ marginBottom: '0.5rem' }}>{user.name}</h2>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>{user.email}</p>

                <div style={{ width: '100%', textAlign: 'left', marginBottom: '2rem' }}>
                    <div style={infoRow}>
                        <span style={labelStyle}>Role</span>
                        <span style={valueStyle}>{user.role.toUpperCase()}</span>
                    </div>
                    <div style={infoRow}>
                        <span style={labelStyle}>Total Rides</span>
                        <span style={valueStyle}>{history.length}</span>
                    </div>
                    <div style={infoRow}>
                        <span style={labelStyle}>Member Since</span>
                        <span style={valueStyle}>Jan 2026</span>
                    </div>
                </div>

                <button onClick={logout} style={logoutBtnStyle}>
                    Sign Out
                </button>
            </div>

            {/* Leaderboard Section */}
            <div style={{ width: '100%', maxWidth: '400px', marginTop: '3rem' }}>
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

            <BottomNav />
        </div>
    );
}

const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '2rem 1rem 80px 1rem', // padding bottom for nav
    background: CONTENT.COLORS.passenger_bg,
    color: '#fff',
    alignItems: 'center'
};

const cardStyle = {
    background: '#222',
    padding: '2rem',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    border: '1px solid #333'
};

const avatarCircle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: '1rem'
};

const infoRow = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0',
    borderBottom: '1px solid #333'
};

const labelStyle = {
    color: '#888'
};

const valueStyle = {
    fontWeight: 'bold' as const
};

const logoutBtnStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #ff4d4d',
    background: 'rgba(255, 77, 77, 0.1)',
    color: '#ff4d4d',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem'
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
