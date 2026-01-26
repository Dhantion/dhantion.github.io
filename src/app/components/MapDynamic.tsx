'use client';
import dynamic from 'next/dynamic';

const RideMap = dynamic(() => import('./RideMap'), {
    ssr: false,
    loading: () => <div style={{ height: '300px', background: '#222', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>,
});

export default RideMap;
