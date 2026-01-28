'use client';
import { useRide } from '../context/RideContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RideMap from '../components/MapDynamic';
import BottomNav from '../components/BottomNav';
import RideTimer from '../components/RideTimer';
import { LOCATIONS } from '../constants/locations'; // Updated import

import { CONTENT } from '../constants/content';

export default function DriverPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const { ride, incomingRequests, acceptRide, declineRide, startRide, endRide, closeRide, createRideByDriver, cancelRide, stats } = useRide();
    const [isCreatingOffer, setIsCreatingOffer] = useState(false);
    const [offerPickup, setOfferPickup] = useState('');
    const [offerDest, setOfferDest] = useState('');

    useEffect(() => {
        if (!loading && (!user || user.role !== 'driver')) {
            router.push('/login');
        }
    }, [user, loading, router]);
    // ... (rest of the file remains, but adding selectStyle at the end)

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

    if (loading) return <div className="loader" style={{ margin: '5rem auto' }}></div>;
    if (!user) return null;

    const getPos = (name: string): [number, number] | undefined => LOCATIONS[name];

    return (
        <div style={containerStyle}>
            {/* Adjusted maxWidth to 600px to match Passenger interface as requested */}
            <div style={{ padding: '2rem', maxWidth: '600px', width: '100%', margin: '0 auto', color: '#fff', paddingBottom: '80px', boxSizing: 'border-box' }}>

                <h1>{CONTENT.driver_home.welcome_message}, {user.name} 🚕</h1>

                {/* SYSTEM STATS BAR */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    background: CONTENT.COLORS.card_bg,
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: `1px solid ${CONTENT.COLORS.card_border}`,
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

                {/* If there is an active ride (Accepted or Ongoing), show ONLY that ride */}
                {ride.status === 'ACCEPTED' && (
                    <div style={activeCardStyle}>
                        <h2>{CONTENT.driver_home.ride_active}</h2>
                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            🚖 {CONTENT.driver_home.passenger_label} <span style={{ color: '#4facfe' }}>{ride.passengerName || 'Unknown'}</span>
                        </p>
                        <p>{CONTENT.driver_home.go_to_pickup} {ride.pickup}</p>
                        <p style={{ marginTop: '1rem', color: '#ffd700', fontWeight: 'bold' }}>Waiting for passenger to start the trip... ⏳</p>
                    </div>
                )}

                {/* WAITING FOR PASSENGER TO CONFIRM PICKUP */}
                {ride.status === 'WAITING_FOR_PICKUP_CONFIRM' && (
                    <div style={{ ...activeCardStyle, borderColor: 'yellow' }}>
                        <h2>Waiting for Passenger Confirmation... ⏳</h2>
                        <p>You have arrived. Waiting for {ride.passengerName} to confirm they are in the car.</p>
                        <div className="loader" style={{ margin: '1rem auto', borderColor: 'yellow', borderTopColor: 'transparent' }}></div>
                        <button onClick={() => cancelRide(ride.id || '')} style={{ ...secondaryButtonStyle, background: 'red', borderColor: 'red', color: 'white', marginTop: '1rem' }}>Cancel Ride</button>
                    </div>
                )}

                {ride.status === 'ONGOING' && (
                    <div style={activeCardStyle}>
                        <h2>{CONTENT.driver_home.driving_label}</h2>
                        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            {CONTENT.driver_home.with_label} <span style={{ color: '#4facfe' }}>{ride.passengerName}</span>
                        </p>

                        {ride.startTime && <RideTimer startTime={ride.startTime} />}

                        <RideMap
                            center={[39.8681, 32.7483]}
                            zoom={14}
                            markers={[
                                ...(getPos(ride.pickup) ? [{ position: getPos(ride.pickup)!, popup: 'Start' }] : []),
                                ...(getPos(ride.destination) ? [{ position: getPos(ride.destination)!, popup: 'Goal', isSelected: true }] : [])
                            ]}
                        />
                        {ride.pickup && ride.destination && LOCATIONS[ride.pickup] && LOCATIONS[ride.destination] && (
                            <button
                                onClick={() => {
                                    const start = LOCATIONS[ride.pickup];
                                    const end = LOCATIONS[ride.destination];
                                    if (start && end) {
                                        window.open(`https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&travelmode=driving`, '_blank');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    marginTop: '0.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    background: '#fff',
                                    color: '#333',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Open in Google Maps 🗺️
                            </button>
                        )}
                        <p style={{ marginTop: '1rem' }}>Destination: {ride.destination}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={() => cancelRide(ride.id || '')} style={{ ...secondaryButtonStyle, background: 'red', borderColor: 'red', color: 'white' }}>Cancel Ride</button>
                            <button onClick={endRide} style={{ ...buttonStyle, background: '#43e97b', color: '#000' }}>Finish Trip</button>
                        </div>
                    </div>
                )}

                {/* WAITING FOR PASSENGER TO CONFIRM DROPOFF */}
                {ride.status === 'WAITING_FOR_DROPOFF_CONFIRM' && (
                    <div style={{ ...activeCardStyle, borderColor: 'yellow' }}>
                        <h2>Waiting for Dropoff Confirmation... ⏳</h2>
                        <p>You have ended the trip. Waiting for {ride.passengerName} to confirm payment/exit.</p>
                        <div className="loader" style={{ margin: '1rem auto', borderColor: 'yellow', borderTopColor: 'transparent' }}></div>
                        <button onClick={() => cancelRide(ride.id || '')} style={{ ...secondaryButtonStyle, background: 'red', borderColor: 'red', color: 'white', marginTop: '1rem' }}>Cancel Ride</button>
                    </div>
                )}

                {(ride.status === 'FINISHED' || ride.status === 'COMPLETED') && (
                    <div style={successCardStyle}>
                        <h2>{CONTENT.driver_home.trip_finished}</h2>
                        <p>{CONTENT.driver_home.great_job}</p>

                        {ride.startTime && ride.endTime && (
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', margin: '1rem 0' }}>
                                ⏱ Time: {(() => {
                                    try {
                                        const start = ride.startTime.seconds * 1000;
                                        // Use endTime or current time if missing for some reason
                                        const end = ride.endTime ? ride.endTime.seconds * 1000 : Date.now();
                                        const diff = Math.floor((end - start) / 60000);
                                        const secs = Math.floor(((end - start) % 60000) / 1000);
                                        return `${diff}m ${secs}s`;
                                    } catch (e) { return 'Calculating...'; }
                                })()}
                            </div>
                        )}

                        <p style={{ marginTop: '0.5rem', color: CONTENT.COLORS.text_highlight_blue }}>{CONTENT.driver_home.thank_you}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={closeRide} style={buttonStyle}>{CONTENT.driver_home.back_to_queue}</button>
                        </div>
                    </div>
                )}

                {ride.status === 'CANCELLED' && (
                    <div style={{ ...cardStyle, borderColor: 'red' }}>
                        <h2 style={{ color: 'red' }}>Ride Cancelled</h2>
                        <p>The passenger cancelled the ride.</p>
                        <button onClick={closeRide} style={secondaryButtonStyle}>Dismiss</button>
                    </div>
                )}

                {ride.status === 'OFFERED' && (
                    <div style={{ ...activeCardStyle, borderColor: 'orange' }}>
                        <h2 style={{ color: 'orange' }}>Ride Offer Created! 📢</h2>
                        <div className="loader" style={{ margin: '1rem auto', borderColor: 'orange', borderTopColor: 'transparent' }}></div>
                        <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>Waiting for a passenger to join...</p>

                        <div style={{ textAlign: 'left', background: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.2rem', border: '1px solid rgba(255, 165, 0, 0.3)' }}>
                            <p><strong>Pickup:</strong> {ride.pickup}</p>
                            <p><strong>Destination:</strong> {ride.destination}</p>
                        </div>

                        <button onClick={() => cancelRide(ride.id)} style={{ ...secondaryButtonStyle, color: 'orange', borderColor: 'orange' }}>Cancel Offer</button>
                    </div>
                )}

                {/* If NO active ride (Status IDLE), show list of requests OR Create Offer */}
                {ride.status === 'IDLE' && (
                    <div>
                        {/* Toggle or Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                                {isCreatingOffer ? 'Create Ride Offer' : CONTENT.driver_home.active_requests_title}
                            </h2>
                            <button
                                onClick={() => setIsCreatingOffer(!isCreatingOffer)}
                                style={{
                                    background: isCreatingOffer ? '#333' : '#4facfe',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isCreatingOffer ? '← Back to Requests' : '+ Create Offer'}
                            </button>
                        </div>

                        {isCreatingOffer ? (
                            <div style={cardStyle}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Where are you going? 🚕</h3>
                                <form onSubmit={(e) => { e.preventDefault(); if (offerPickup && offerDest && offerPickup !== offerDest) { createRideByDriver(offerPickup, offerDest, user.name); setIsCreatingOffer(false); } }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    <div>
                                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: '#aaa' }}>Pickup Location</label>
                                        <select value={offerPickup} onChange={(e) => setOfferPickup(e.target.value)} style={selectStyle} required>
                                            <option value="" disabled>Select Starting Point</option>
                                            {Object.keys(LOCATIONS).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: '#aaa' }}>Destination</label>
                                        <select value={offerDest} onChange={(e) => setOfferDest(e.target.value)} style={selectStyle} required>
                                            <option value="" disabled>Select Destination</option>
                                            {Object.keys(LOCATIONS).map(loc => <option key={loc} value={loc} disabled={loc === offerPickup}>{loc}</option>)}
                                        </select>
                                    </div>

                                    <button type="submit" style={{ ...buttonStyle, marginTop: '1rem' }} disabled={!offerPickup || !offerDest}>Publish Ride Offer</button>
                                </form>
                            </div>
                        ) : (
                            // Existing Requests List
                            <>
                                {incomingRequests.length === 0 ? (
                                    <div style={noRequestCardStyle}>
                                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>{CONTENT.driver_home.no_requests_title}</h2>
                                        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '1.5rem' }}>{CONTENT.driver_home.waiting_text} ⏳</p>
                                        <button onClick={() => setIsCreatingOffer(true)} style={buttonStyle}>
                                            + Create Ride Offer Instead
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2rem',
                                        width: '100%'
                                    }}>
                                        {incomingRequests.map((req) => (
                                            <div key={req.id} style={requestCardStyle}>

                                                {/* Header & Passenger Row */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#00f2fe' }}>{CONTENT.driver_home.new_request_title}</h2>
                                                    <div style={{ background: '#333', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                                                        👤 <strong>{req.passengerName || 'Passenger'}</strong>
                                                    </div>
                                                </div>

                                                {/* Map Area */}
                                                <div style={{ height: '150px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid #444' }}>
                                                    <RideMap
                                                        center={[39.8681, 32.7483]}
                                                        zoom={13}
                                                        markers={[
                                                            ...(getPos(req.pickup) ? [{ position: getPos(req.pickup)!, popup: 'Pickup', isSelected: true }] : []),
                                                            ...(getPos(req.destination) ? [{ position: getPos(req.destination)!, popup: 'Dropoff' }] : [])
                                                        ]}
                                                    />
                                                </div>

                                                {/* Route Info Box */}
                                                <div style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.2rem' }}>
                                                    <div style={{ marginBottom: '0.8rem' }}>
                                                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem', display: 'flex', alignItems: 'center' }}>
                                                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#43e97b', marginRight: '6px' }}></span>
                                                            PICKUP
                                                        </div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', paddingLeft: '14px' }}>{req.pickup}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem', display: 'flex', alignItems: 'center' }}>
                                                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ff416c', marginRight: '6px' }}></span>
                                                            DROPOFF
                                                        </div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', paddingLeft: '14px' }}>{req.destination}</div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <button
                                                        onClick={() => req.id && acceptRide(req.id, user.uid || 'driver-1', user.name)}
                                                        style={{ ...buttonStyle, background: '#43e97b', color: '#000' }}
                                                    >
                                                        {CONTENT.driver_home.accept_button}
                                                    </button>
                                                    <button
                                                        onClick={() => req.id && declineRide(req.id)}
                                                        style={{ ...secondaryButtonStyle, background: 'rgba(255, 65, 108, 0.15)', color: '#ff416c', border: '1px solid rgba(255, 65, 108, 0.3)' }}
                                                    >
                                                        {CONTENT.driver_home.decline_button}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                <BottomNav role="driver" />
            </div>
        </div>
    );
}

const containerStyle = {
    minHeight: '100vh',
    background: CONTENT.COLORS.driver_bg,
    color: CONTENT.COLORS.text_primary,
    display: 'flex',
    flexDirection: 'column' as const
};

const buttonStyle = {
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: 'none',
    background: CONTENT.COLORS.btn_driver_action_bg,
    color: '#000',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1
};

const secondaryButtonStyle = {
    ...buttonStyle,
    background: CONTENT.COLORS.btn_secondary_bg,
    color: CONTENT.COLORS.btn_secondary_text
};

const cardStyle = {
    marginTop: '0',
    padding: '2rem',
    borderRadius: '12px',
    background: CONTENT.COLORS.card_bg,
    border: `1px solid ${CONTENT.COLORS.card_border}`,
    textAlign: 'center' as const
};

const noRequestCardStyle = {
    marginTop: '4rem',
    padding: '4rem 2rem',
    borderRadius: '16px',
    background: CONTENT.COLORS.card_bg,
    border: `1px solid ${CONTENT.COLORS.card_border}`,
    textAlign: 'center' as const,
    backdropFilter: 'blur(10px)'
};

const requestCardStyle = {
    ...cardStyle,
    marginTop: '0',
    borderColor: CONTENT.COLORS.text_highlight_blue, // Keep blue border
    background: CONTENT.COLORS.card_bg, // Solid background (Box look)
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)' // Add shadow for better "box" feel
};

const activeCardStyle = {
    ...cardStyle,
    marginTop: '2rem',
    borderColor: CONTENT.COLORS.text_highlight_pink,
};

const selectStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: `1px solid #444`,
    background: '#333',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
};

const successCardStyle = {
    ...cardStyle,
    borderColor: '#4facfe', // Blue border
    background: CONTENT.COLORS.card_bg,
    boxShadow: `0 4px 12px rgba(79, 172, 254, 0.3)` // Blue shadow
};
