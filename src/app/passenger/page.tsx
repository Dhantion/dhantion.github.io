'use client';
import { useState, useEffect } from 'react';
import { useRide } from '../context/RideContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';
import RideMap from '../components/MapDynamic';
import RideTimer from '../components/RideTimer';
import { LOCATIONS } from '../constants/locations'; // Fixed import path

import { CONTENT } from '../constants/content';

export default function PassengerPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const { ride, requestRide, cancelRide, closeRide, incomingDriverOffers, joinRide, confirmPickupByPassenger, confirmDropoffByPassenger, stats } = useRide();
    const [pickup, setPickup] = useState('');
    const [dest, setDest] = useState('');

    useEffect(() => {
        if (!loading && (!user || user.role !== 'passenger')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return <div className="loader" style={{ margin: '5rem auto' }}></div>;
    if (!user) return null;

    const handleRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (pickup && dest && pickup !== dest) requestRide(pickup, dest, user.name);
    };

    const locationOptions = Object.keys(LOCATIONS);

    // Filter offers that match current selection (if any)
    const matchingOffers = incomingDriverOffers.filter(
        offer => (!pickup || offer.pickup === pickup) && (!dest || offer.destination === dest)
    );

    return (
        <div style={containerStyle}>
            <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem' }}>{CONTENT.passenger_home.welcome_message}, {user.name} 👋</h1>
                </div>

                {/* SYSTEM STATS BAR */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4facfe' }}>{stats?.activePassengers || 0}</div>
                        <div style={{ fontSize: '0.9rem', color: '#aaa' }}>🙋 Active Passengers</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f093fb' }}>{stats?.activeDrivers || 0}</div>
                        <div style={{ fontSize: '0.9rem', color: '#aaa' }}>🚕 Active Drivers</div>
                    </div>
                </div>

                {ride.status === 'IDLE' && (
                    <>
                        <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={labelStyle}>{CONTENT.passenger_home.pickup_label}</label>
                                <select
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    style={selectStyle}
                                    required
                                >
                                    <option value="">{CONTENT.passenger_home.select_pickup}</option>
                                    {locationOptions.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>{CONTENT.passenger_home.destination_label}</label>
                                <select
                                    value={dest}
                                    onChange={(e) => setDest(e.target.value)}
                                    style={selectStyle}
                                    required
                                >
                                    <option value="">{CONTENT.passenger_home.select_destination}</option>
                                    {locationOptions.map(loc => (
                                        <option key={loc} value={loc} disabled={loc === pickup}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" style={btnStyle} disabled={!pickup || !dest}>{CONTENT.passenger_home.request_button}</button>
                        </form>

                        {/* Display Available Driver Offers */}
                        {matchingOffers.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: '#4facfe', marginBottom: '1rem' }}>Available Driver Offers 🚕</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {matchingOffers.map(offer => (
                                        <div key={offer.id} style={{
                                            background: '#222',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #444',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#fff' }}>{offer.driverName}</div>
                                                <div style={{ fontSize: '0.9rem', color: '#aaa' }}>{offer.pickup} ➔ {offer.destination}</div>
                                            </div>
                                            <button
                                                onClick={() => offer.id && joinRide(offer.id as string, user.uid || '', user.name || '')}
                                                style={{
                                                    background: '#4facfe',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Join Ride
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
                            {/* RideMap remains same */}
                            <RideMap
                                center={[39.8681, 32.7483]}
                                zoom={13}
                                markers={[
                                    ...(pickup && LOCATIONS[pickup] ? [{ position: LOCATIONS[pickup], popup: 'Pickup', isSelected: true }] : []),
                                    ...(dest && LOCATIONS[dest] ? [{ position: LOCATIONS[dest], popup: 'Destination', isSelected: true }] : [])
                                ]}
                            />
                        </div>
                    </>
                )}

                {ride.status === 'REQUESTED' && (
                    <div style={cardStyle}>
                        <h2>{CONTENT.passenger_home.looking_for_driver}</h2>
                        <div className="loader" style={{ margin: '1rem auto' }}></div>
                        <p style={{ marginTop: '1rem' }}>{CONTENT.passenger_home.pickup_label}: {ride.pickup}</p>
                        <p>{CONTENT.passenger_home.destination_label}: {ride.destination}</p>
                        <button onClick={() => cancelRide()} style={secondaryButtonStyle}>{CONTENT.passenger_home.cancel_request}</button>
                    </div>
                )}

                {ride.status === 'ACCEPTED' && (
                    <div style={successCardStyle}>
                        <h2>{CONTENT.passenger_home.driver_accepted}</h2>
                        <p>{CONTENT.passenger_home.driver_on_way}</p>
                        <p style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '0.5rem' }}>{CONTENT.passenger_home.rate_driver} {ride.driverName}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={confirmPickupByPassenger} style={btnStyle}>Start Ride (I'm in) 🚕</button>
                        </div>
                        <button onClick={() => cancelRide()} style={secondaryButtonStyle}>{CONTENT.passenger_home.cancel_request}</button>
                    </div>
                )}

                {/* WAITING FOR PASSENGER TO CONFIRM PICKUP */}
                {ride.status === 'WAITING_FOR_PICKUP_CONFIRM' && (
                    <div style={activeCardStyle}>
                        <h2>Driver Arrived! 🚕</h2>
                        <p style={{ margin: '1rem 0' }}>Your driver {ride.driverName} says they have arrived.</p>
                        <p style={{ fontWeight: 'bold', color: '#fff' }}>Are you in the car?</p>
                        <button onClick={confirmPickupByPassenger} style={btnStyle}>Yes, I'm in request ride</button>
                    </div>
                )}

                {ride.status === 'ONGOING' && (
                    <div style={activeCardStyle}>
                        <h2>{CONTENT.passenger_home.ride_in_progress}</h2>
                        <p style={{ fontSize: '1.2rem', margin: '1rem 0', color: CONTENT.COLORS.text_highlight_purple }}>
                            {CONTENT.passenger_home.now_riding_with} {ride.driverName} 🚕
                        </p>

                        {ride.startTime && <RideTimer startTime={ride.startTime} />}

                        <div style={{ height: '200px', margin: '1rem 0', borderRadius: '8px', overflow: 'hidden' }}>
                            {/* RideMap remains same */}
                            <RideMap
                                center={[39.8681, 32.7483]}
                                markers={[
                                    ...(ride.pickup && LOCATIONS[ride.pickup] ? [{ position: LOCATIONS[ride.pickup], popup: 'Pickup' }] : []),
                                    ...(ride.destination && LOCATIONS[ride.destination] ? [{ position: LOCATIONS[ride.destination], popup: 'Destination' }] : [])
                                ]}
                            />
                        </div>
                        <p>{CONTENT.passenger_home.heading_to} {ride.destination}...</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => cancelRide()} style={{ ...secondaryButtonStyle, marginTop: '0', background: 'red', color: 'white' }}>Cancel Ride</button>
                            <button onClick={confirmDropoffByPassenger} style={{ ...btnStyle, marginTop: '0', background: '#43e97b', color: '#000' }}>Finish Ride</button>
                        </div>
                    </div>
                )}

                {/* WAITING FOR PASSENGER TO CONFIRM DROPOFF */}
                {ride.status === 'WAITING_FOR_DROPOFF_CONFIRM' && (
                    <div style={{ ...activeCardStyle, borderColor: '#4facfe' }}>
                        <h2>Arrived at Destination! 🏁</h2>
                        <p style={{ margin: '1rem 0' }}>The driver has ended the trip.</p>
                        <p style={{ fontWeight: 'bold', color: '#fff' }}>Confirm you have exited?</p>
                        <button onClick={confirmDropoffByPassenger} style={btnStyle}>Yes, Trip Complete</button>
                    </div>
                )}

                {(ride.status === 'FINISHED' || ride.status === 'COMPLETED') && (
                    <div style={completedCardStyle}>
                        <h2 style={{ color: '#4facfe' }}>{CONTENT.passenger_home.arrived_message}</h2>
                        <p style={{ margin: '1rem 0' }}>{CONTENT.passenger_home.completed_message}</p>

                        {ride.startTime && ride.endTime && (
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                ⏱ Time: {(() => {
                                    try {
                                        // startTime/endTime are Firestore Timestamps
                                        const start = ride.startTime.seconds * 1000;
                                        const end = ride.endTime.seconds * 1000;
                                        const diff = Math.floor((end - start) / 60000); // mins
                                        const secs = Math.floor(((end - start) % 60000) / 1000);
                                        return `${diff}m ${secs}s`;
                                    } catch (e) { return 'Calculating...'; }
                                })()}
                            </div>
                        )}

                        <p style={{ marginBottom: '1rem', color: CONTENT.COLORS.text_highlight_pink }}>{CONTENT.passenger_home.thank_you}</p>
                        <button onClick={closeRide} style={btnStyle}>{CONTENT.passenger_home.new_ride_button}</button>
                    </div>
                )}

                {ride.status === 'CANCELLED' && (
                    <div style={{ ...cardStyle, borderColor: 'red' }}>
                        <h2 style={{ color: 'red' }}>Ride Cancelled</h2>
                        <p style={{ margin: '1rem 0' }}>This ride has been cancelled.</p>
                        <button onClick={closeRide} style={{ ...btnStyle, background: 'red' }}>Dismiss</button>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}

const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    background: CONTENT.COLORS.passenger_bg,
    color: CONTENT.COLORS.text_primary,
    paddingBottom: '64px'
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: CONTENT.COLORS.text_secondary,
    fontSize: '0.9rem'
};

const selectStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: `1px solid #444`,
    background: '#333',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '1rem',
    outline: 'none'
};

const btnStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: CONTENT.COLORS.btn_passenger_bg, // Purple
    color: CONTENT.COLORS.btn_primary_text,
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem'
};

const secondaryButtonStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: CONTENT.COLORS.btn_secondary_bg,
    color: CONTENT.COLORS.btn_secondary_text,
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem'
};

const cardStyle = {
    marginTop: '2rem',
    padding: '2rem',
    borderRadius: '12px',
    background: CONTENT.COLORS.card_bg,
    border: `1px solid ${CONTENT.COLORS.card_border}`,
    textAlign: 'center' as const
};

const successCardStyle = {
    ...cardStyle,
    borderColor: CONTENT.COLORS.text_highlight_purple, // Purple border
    background: CONTENT.COLORS.card_bg,
    boxShadow: `0 4px 12px rgba(213, 0, 249, 0.3)` // Purple shadow
};

const activeCardStyle = {
    ...cardStyle,
    borderColor: CONTENT.COLORS.text_highlight_purple, // Purple border
    background: CONTENT.COLORS.card_bg, // SOLID BACKGROUND as requested
    boxShadow: `0 4px 12px rgba(213, 0, 249, 0.3)` // Add shadow for better visibility
};

const completedCardStyle = {
    ...cardStyle,
    borderColor: '#4facfe'
};
