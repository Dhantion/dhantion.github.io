'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, updateDoc, doc } from 'firebase/firestore';

export default function AdminPage() {
    const { user, logout, getAllUsers, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [rides, setRides] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
            return;
        }

        if (user && !loading) {
            // Listen for Users (Real-time for "Active" status)
            const usersQ = query(collection(db, 'users'));
            const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
                const fetchedUsers = snapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));
                setUsers(fetchedUsers);
            });

            // Listen for Rides (Real-time)
            const q = query(collection(db, 'rides'), orderBy('createdAt', 'desc'));
            const unsubscribeRides = onSnapshot(q, (snapshot) => {
                const ridesData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toLocaleString('tr-TR') : 'N/A'
                    };
                });
                setRides(ridesData);
            });

            return () => {
                unsubscribeUsers();
                unsubscribeRides();
            };
        }
    }, [user, loading, router]);

    const handleCancelRide = async (rideId: string) => {
        if (confirm('Are you sure you want to cancel this ride?')) {
            try {
                await updateDoc(doc(db, 'rides', rideId), {
                    status: 'CANCELLED'
                });
            } catch (error) {
                console.error("Error cancelling ride:", error);
                alert("Failed to cancel ride.");
            }
        }
    };

    if (loading) return <div className="loader" style={{ margin: '5rem auto' }}></div>;
    if (!user || user.role !== 'admin') return null;

    // Filter "Online" Users (active in last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const activePassengers = users.filter(u => {
        if (u.role !== 'passenger' || !u.lastSeen) return false;
        const lastSeenDate = u.lastSeen.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen);
        return lastSeenDate.getTime() > fiveMinutesAgo;
    });

    const activeDrivers = users.filter(u => {
        if (u.role !== 'driver' || !u.lastSeen) return false;
        const lastSeenDate = u.lastSeen.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen);
        return lastSeenDate.getTime() > fiveMinutesAgo;
    });

    const formatLastSeen = (lastSeen: any) => {
        if (!lastSeen) return '';
        const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
        const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
        if (diffMins < 1) return 'Just now';
        return `${diffMins}m ago`;
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ color: '#00f2fe' }}>Admin Dashboard 🛡️</h1>
                <button onClick={logout} style={logoutBtn}>Logout</button>
            </div>

            {/* Active Users Statistics Section (ONLINE USERS) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* Active Passengers */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                        <h2 style={{ ...headerStyle, color: '#d500f9', fontSize: '1.2rem', marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>🟣 Active Passengers (Online)</h2>
                        <span style={{ background: '#333', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>{activePassengers.length}</span>
                    </div>

                    {activePassengers.length === 0 ? (
                        <p style={{ color: '#888' }}>No passengers online.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {activePassengers.map(u => (
                                <li key={u.uid} style={{ marginBottom: '0.8rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#4facfe' }}>
                                        Are: <span style={{ color: '#00f900' }}>{formatLastSeen(u.lastSeen)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Active Drivers */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                        <h2 style={{ ...headerStyle, color: 'orange', fontSize: '1.2rem', marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>🟠 Active Drivers (Online)</h2>
                        <span style={{ background: '#333', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>{activeDrivers.length}</span>
                    </div>

                    {activeDrivers.length === 0 ? (
                        <p style={{ color: '#888' }}>No drivers online.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {activeDrivers.map(u => (
                                <li key={u.uid} style={{ marginBottom: '0.8rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'orange' }}>
                                        Are: <span style={{ color: '#00f900' }}>{formatLastSeen(u.lastSeen)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Users Section */}
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>All Registered Users</h2>
                {users.length === 0 ? (
                    <p style={{ color: '#888' }}>No users registered yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={tdStyle}>{u.name}</td>
                                        <td style={{ ...tdStyle, color: '#aaa' }}>{u.email}</td>
                                        <td style={tdStyle}>
                                            <span style={u.role === 'driver' ? driverBadge : passengerBadge}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Rides Section */}
            <div>
                {/* Active Rides Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>

                    {/* Requested Rides */}
                    <div style={cardStyle}>
                        <h2 style={{ ...headerStyle, color: 'orange' }}>🟠 Requested</h2>
                        {rides.filter(r => r.status === 'REQUESTED').length === 0 ? (
                            <p style={{ color: '#888' }}>No pending requests.</p>
                        ) : (
                            renderRideTable(rides.filter(r => r.status === 'REQUESTED'), handleCancelRide)
                        )}
                    </div>

                    {/* Ongoing Rides */}
                    <div style={cardStyle}>
                        <h2 style={{ ...headerStyle, color: '#00f2fe' }}>🔵 Ongoing</h2>
                        {rides.filter(r => ['ACCEPTED', 'ONGOING'].includes(r.status)).length === 0 ? (
                            <p style={{ color: '#888' }}>No rides in progress.</p>
                        ) : (
                            renderRideTable(rides.filter(r => ['ACCEPTED', 'ONGOING'].includes(r.status)), handleCancelRide)
                        )}
                    </div>
                </div>

                {/* Completed History Toggle */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                        <h2>Ride History</h2>
                        <button onClick={() => setShowHistory(!showHistory)} style={toggleBtn}>
                            {showHistory ? 'Hide History ▲' : 'Show Completed Rides ▼'}
                        </button>
                    </div>

                    {showHistory && (
                        <div>
                            {rides.filter(r => r.status === 'COMPLETED').length === 0 ? (
                                <p style={{ color: '#888' }}>No completed rides found.</p>
                            ) : (
                                renderRideTable(rides.filter(r => r.status === 'COMPLETED'))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const renderRideTable = (ridesList: any[], onCancel?: (id: string) => void) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th style={thStyle}>Route</th>
                    <th style={thStyle}>Passenger / Driver</th>
                    {onCancel && <th style={thStyle}>Action</th>}
                </tr>
            </thead>
            <tbody>
                {ridesList.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #333' }}>
                        <td style={tdStyle}>
                            <div style={{ fontWeight: 'bold' }}>{r.pickup}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>➝ {r.destination}</div>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.2rem' }}>{r.createdAt}</div>
                        </td>
                        <td style={tdStyle}>
                            <div>👤 {r.passengerName || 'Unknown'}</div>
                            <div style={{ color: '#aaa' }}>🚕 {r.driverName || 'Waiting...'}</div>
                        </td>
                        {onCancel && (
                            <td style={tdStyle}>
                                <button
                                    onClick={() => onCancel(r.id)}
                                    style={{
                                        background: 'rgba(255, 65, 108, 0.2)',
                                        color: '#ff416c',
                                        border: '1px solid #ff416c',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Cancel
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const getStatusBadge = (status: string) => {
    const base = {
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: 'bold' as const,
        display: 'inline-block'
    };
    switch (status) {
        case 'REQUESTED': return { ...base, background: 'rgba(255, 165, 0, 0.2)', color: 'orange' };
        case 'ACCEPTED': return { ...base, background: 'rgba(79, 172, 254, 0.2)', color: '#4facfe' };
        case 'ONGOING': return { ...base, background: 'rgba(0, 242, 254, 0.2)', color: '#00f2fe' };
        case 'COMPLETED': return { ...base, background: 'rgba(67, 233, 123, 0.2)', color: '#43e97b' };
        default: return { ...base, background: '#333', color: '#888' };
    }
};

const cardStyle = {
    background: '#222',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid #333'
};

const logoutBtn = {
    background: 'transparent',
    border: '1px solid #444',
    color: '#aaa',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
};

const thStyle = {
    padding: '1rem',
    color: '#888',
    fontSize: '0.9rem',
    textTransform: 'uppercase' as const
};

const tdStyle = {
    padding: '1rem',
};

const badgeBase = {
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 'bold' as const
};

const driverBadge = {
    ...badgeBase,
    background: 'rgba(0, 242, 254, 0.1)',
    color: '#00f2fe'
};

const passengerBadge = {
    ...badgeBase,
    background: 'rgba(79, 172, 254, 0.1)',
    color: '#4facfe'
};

const headerStyle = {
    marginBottom: '1.5rem',
    borderBottom: '1px solid #333',
    paddingBottom: '1rem',
    fontSize: '1.2rem'
};

const toggleBtn = {
    background: '#333',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
};
