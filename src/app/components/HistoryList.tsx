import { CONTENT } from '../constants/content';
import { useRide } from '../context/RideContext';
import BottomNav from './BottomNav';

export default function HistoryPage({ role }: { role: 'passenger' | 'driver' }) {
    const { history } = useRide();

    const bgColor = role === 'passenger'
        ? CONTENT.COLORS.passenger_bg
        : CONTENT.COLORS.driver_bg;

    return (
        <div style={{ minHeight: '100vh', background: bgColor, color: CONTENT.COLORS.text_primary }}>
            {/* Increased maxWidth to solve "rectangle" feel, added width: 100% */}
            <div style={{ padding: '2rem', maxWidth: '100%', width: '100%', margin: '0 auto', paddingBottom: '80px', boxSizing: 'border-box' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>{role === 'passenger' ? CONTENT.history.my_trip_history : CONTENT.history.earnings_history}</h1>

                {history.length === 0 ? (
                    <p style={{ color: CONTENT.COLORS.text_secondary, textAlign: 'center', marginTop: '3rem' }}>{CONTENT.history.no_trips}</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                        {history.map((trip) => (
                            <div key={trip.id} style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: CONTENT.COLORS.text_secondary }}>{trip.date}</span>
                                    <span style={{ color: CONTENT.COLORS.text_highlight_blue, fontWeight: 'bold' }}>
                                        {trip.time}
                                    </span>
                                </div>
                                {trip.duration && trip.duration !== 'N/A' && (
                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        ⏱ Duration: <span style={{ color: '#fff' }}>{trip.duration}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0 }}><strong>{trip.pickup}</strong> &rarr; <strong>{trip.destination}</strong></p>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: CONTENT.COLORS.text_secondary }}>
                                            {role === 'passenger'
                                                ? `${CONTENT.history.driver_prefix} ${trip.driverName || CONTENT.history.unknown}`
                                                : `${CONTENT.history.passenger_prefix} ${trip.passengerName || CONTENT.history.unknown}`}
                                        </p>
                                    </div>
                                    <div style={{
                                        ...statusStyle,
                                        background: trip.status === 'CANCELLED' ? CONTENT.COLORS.btn_secondary_bg : CONTENT.COLORS.status_success,
                                        color: trip.status === 'CANCELLED' ? '#fff' : '#000'
                                    }}>{trip.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav role={role} />
        </div>
    );
}

const cardStyle = {
    padding: '1.5rem',
    borderRadius: '12px',
    background: CONTENT.COLORS.card_bg,
    border: `1px solid ${CONTENT.COLORS.card_border}`,
};

const statusStyle = {
    fontSize: '0.8rem',
    background: CONTENT.COLORS.status_success,
    color: '#000',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontWeight: 'bold' as const
};
