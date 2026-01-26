'use client';
import { useState, useEffect } from 'react';

interface RideTimerProps {
    startTime: any;
}

export default function RideTimer({ startTime }: RideTimerProps) {
    const [duration, setDuration] = useState('0m 0s');

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            let startMs: number;

            // Handle Firestore Timestamp (has .toDate) or normal Date/number
            if (startTime.toDate) {
                startMs = startTime.toDate().getTime();
            } else if (startTime.seconds) {
                // Sometimes serialized timestamp comes as { seconds: ..., nanoseconds: ... } without toDate fn
                startMs = startTime.seconds * 1000;
            } else {
                startMs = new Date(startTime).getTime();
            }

            const now = Date.now();
            const diff = now - startMs;

            if (diff < 0) {
                setDuration('0m 0s');
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);

            setDuration(`${mins}m ${secs}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div style={timerStyle}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>⏱</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {duration}
            </span>
        </div>
    );
}

const timerStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    margin: '1rem 0',
    color: '#fff'
};
