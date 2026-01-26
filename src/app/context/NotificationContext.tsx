'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// --- Types ---
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- UI Constants ---
const COLORS = {
    info: { border: '#4facfe', icon: '📢', bg: 'rgba(79, 172, 254, 0.1)' },
    success: { border: '#43e97b', icon: '✅', bg: 'rgba(67, 233, 123, 0.1)' },
    warning: { border: '#f093fb', icon: '🚕', bg: 'rgba(240, 147, 251, 0.1)' },
    error: { border: '#ff416c', icon: '⚠️', bg: 'rgba(255, 65, 108, 0.1)' },
};

// --- Provider Component ---
export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((title: string, message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, title, message, type }]);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: 9999,
                pointerEvents: 'none', // Allow clicking through empty space
            }}>
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        onClick={() => removeNotification(notif.id)}
                        style={{
                            pointerEvents: 'auto',
                            minWidth: '300px',
                            maxWidth: '350px',
                            background: '#222', // Dark premium background
                            color: '#fff',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: `1px solid ${COLORS[notif.type].border}`,
                            borderLeft: `5px solid ${COLORS[notif.type].border}`,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(10px)',
                            cursor: 'pointer',
                            animation: 'slideIn 0.3s ease-out forwards',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '12px'
                        }}
                    >
                        <div style={{ fontSize: '1.5rem' }}>{COLORS[notif.type].icon}</div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: COLORS[notif.type].border }}>{notif.title}</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#ccc', lineHeight: '1.3' }}>{notif.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Animation Styles */}
            <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </NotificationContext.Provider>
    );
}

// --- Hook ---
export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
