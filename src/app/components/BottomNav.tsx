'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, User } from 'lucide-react';

export default function BottomNav({ role = 'passenger' }: { role?: 'passenger' | 'driver' }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const basePath = role === 'driver' ? '/driver' : '/passenger';

    return (
        <div style={navContainerStyle}>
            <Link href={`${basePath}`} style={linkStyle}>
                <div style={isActive(`${basePath}`) ? activeIconStyle : iconStyle}>
                    <Home size={24} />
                    <span style={labelStyle}>Home</span>
                </div>
            </Link>

            <Link href={`${basePath}/history`} style={linkStyle}>
                <div style={isActive(`${basePath}/history`) ? activeIconStyle : iconStyle}>
                    <Clock size={24} />
                    <span style={labelStyle}>History</span>
                </div>
            </Link>

            <Link href={`${basePath}/profile`} style={linkStyle}>
                <div style={isActive(`${basePath}/profile`) ? activeIconStyle : iconStyle}>
                    <User size={24} />
                    <span style={labelStyle}>Profile</span>
                </div>
            </Link>
        </div>
    );
}

const navContainerStyle = {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '64px',
    background: '#1a1a1a',
    borderTop: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.3)'
};

const linkStyle = {
    textDecoration: 'none',
    color: 'inherit',
    flex: 1,
    display: 'flex',
    justifyContent: 'center'
};

const iconStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    color: '#888',
    transition: 'color 0.2s'
};

const activeIconStyle = {
    ...iconStyle,
    color: '#4facfe'
};

const labelStyle = {
    fontSize: '0.7rem',
    marginTop: '4px'
};
