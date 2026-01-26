'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, isInitialized } from '../../lib/firebase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext'; // Imported correctly
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';

// Updated Statuses for Dual Confirmation
type RideStatus =
  | 'IDLE'
  | 'REQUESTED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'WAITING_FOR_PICKUP_CONFIRM' // Driver arrived, waiting for passenger 
  | 'ONGOING'
  | 'WAITING_FOR_DROPOFF_CONFIRM' // Driver ended, waiting for passenger
  | 'COMPLETED' // Successfully finished and confirmed
  | 'FINISHED' // Can be used as alias or final legacy state, but we will mostly use COMPLETED
  | 'CANCELLED';

interface RideState {
  id?: string;
  status: RideStatus;
  pickup: string;
  destination: string;
  passengerId: string | null;
  driverId: string | null;
  passengerName?: string;
  driverName?: string;
  declinedDriverIds?: string[];
  closedByDriver?: boolean;
  closedByPassenger?: boolean;
  startTime?: any;
  endTime?: any;
}

export interface RideHistoryItem {
  id: string;
  date: string;
  time: string;
  pickup: string;
  destination: string;
  status: RideStatus;
  passengerName?: string;
  driverName?: string;
  timestamp?: number;
  duration?: string;
}

export interface LeaderboardData {
  topDrivers: { name: string; count: number }[];
  topPassengers: { name: string; count: number }[];
}

interface RideContextType {
  ride: RideState;
  incomingRequests: RideState[];
  incomingDriverOffers: RideState[];
  history: RideHistoryItem[];
  leaderboard: LeaderboardData;
  stats: { activeDrivers: number; activePassengers: number };
  requestRide: (pickup: string, destination: string, passengerName: string) => Promise<void>;
  createRideByDriver: (pickup: string, destination: string, driverName: string) => Promise<void>;
  joinRide: (rideId: string, passengerId: string, passengerName: string) => Promise<void>;
  acceptRide: (rideId: string, driverId: string, driverName: string) => Promise<void>;
  declineRide: (rideId: string) => Promise<void>;
  startRide: () => Promise<void>; // Driver says "I'm here / Let's go"
  confirmPickupByPassenger: () => Promise<void>; // Passenger says "I'm in" -> Status ONGOING
  endRide: () => Promise<void>; // Driver says "We arrived"
  confirmDropoffByPassenger: () => Promise<void>; // Passenger says "I'm out" -> Status COMPLETED
  cancelRide: (rideId?: string) => Promise<void>;
  closeRide: () => Promise<void>;
  resetRide: () => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export function RideProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [stats, setStats] = useState({ activeDrivers: 0, activePassengers: 0 });

  // Single active ride state
  const [ride, setRide] = useState<RideState>({
    status: 'IDLE',
    pickup: '',
    destination: '',
    passengerId: null,
    driverId: null,
  });

  // List of requests for drivers
  const [incomingRequests, setIncomingRequests] = useState<RideState[]>([]);

  // List of offers for passengers
  const [incomingDriverOffers, setIncomingDriverOffers] = useState<RideState[]>([]);

  // History state
  const [history, setHistory] = useState<RideHistoryItem[]>([]);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({ topDrivers: [], topPassengers: [] });

  // Listen for active rides
  useEffect(() => {
    if (!user || !isInitialized) return;

    let q = query(
      collection(db, 'rides'),
      where('status', 'in', ['REQUESTED', 'OFFERED', 'ACCEPTED', 'WAITING_FOR_PICKUP_CONFIRM', 'ONGOING', 'WAITING_FOR_DROPOFF_CONFIRM', 'FINISHED', 'COMPLETED', 'CANCELLED'])
    );

    if (q) {
      const unsubscribe = onSnapshot(q, (snapshot) => {

        // 1. NOTIFICATION LOGIC
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const now = Date.now();

            // Check if createdAt exists and is recent (last 30 seconds)
            if (data.createdAt && data.createdAt.toMillis) {
              const createdTime = data.createdAt.toMillis();
              const isNew = (now - createdTime) < 30000;

              if (isNew) {
                // Driver Notification: New Passenger Request
                if (user.role === 'driver' && data.status === 'REQUESTED') {
                  // Don't notify if I am the one who created it
                  if (data.passengerId !== user.uid) {
                    showNotification('New Passenger Request! 🙋‍♂️', `${data.passengerName || 'A passenger'} wants to go to ${data.destination}`, 'info');
                  }
                }

                // Passenger Notification: New Driver Offer
                if (user.role === 'passenger' && data.status === 'OFFERED') {
                  if (data.driverId !== user.uid) {
                    showNotification('New Ride Offer! 🚕', `${data.driverName || 'A driver'} is going to ${data.destination}`, 'warning');
                  }
                }
              }
            }
          }
        });

        if (!snapshot.empty) {
          const docs = snapshot.docs.sort((a, b) => {
            const da = a.data().createdAt;
            const db = b.data().createdAt;
            if (!da || !db) return 0;
            return db.seconds - da.seconds;
          });

          const allRides = docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RideState[];

          // --- STATS CALCULATION ---
          let driverCount = 0;
          let passengerCount = 0;

          allRides.forEach(r => {
            const isActive = ['REQUESTED', 'OFFERED', 'ACCEPTED', 'WAITING_FOR_PICKUP_CONFIRM', 'ONGOING', 'WAITING_FOR_DROPOFF_CONFIRM'].includes(r.status);
            if (isActive) {
              if (r.driverId) driverCount++;
              if (r.passengerId || r.status === 'REQUESTED') passengerCount++;
            }
          });
          setStats({ activeDrivers: driverCount, activePassengers: passengerCount });
          // -------------------------

          if (user.role === 'driver') {
            const myActiveRide = allRides.find(r =>
              r.driverId === user.uid &&
              (['OFFERED', 'ACCEPTED', 'WAITING_FOR_PICKUP_CONFIRM', 'ONGOING', 'WAITING_FOR_DROPOFF_CONFIRM', 'FINISHED', 'COMPLETED', 'CANCELLED'].includes(r.status))
            );

            const requests = allRides.filter(r =>
              r.status === 'REQUESTED' &&
              (!r.declinedDriverIds || !r.declinedDriverIds.includes(user.uid || ''))
            );
            setIncomingRequests(requests);
            setIncomingDriverOffers([]);

            if (myActiveRide) {
              if ((myActiveRide.status === 'COMPLETED' || myActiveRide.status === 'FINISHED' || myActiveRide.status === 'CANCELLED') && myActiveRide.closedByDriver) {
                setRide({ status: 'IDLE', pickup: '', destination: '', passengerId: null, driverId: null });
              } else {
                setRide(myActiveRide);
              }
            } else {
              setRide({ status: 'IDLE', pickup: '', destination: '', passengerId: null, driverId: null });
            }

          } else { // PASSENGER
            const myActiveRide = allRides.find(r =>
              r.passengerId === user.uid &&
              (['REQUESTED', 'ACCEPTED', 'WAITING_FOR_PICKUP_CONFIRM', 'ONGOING', 'WAITING_FOR_DROPOFF_CONFIRM', 'FINISHED', 'COMPLETED', 'CANCELLED'].includes(r.status))
            );

            const offers = allRides.filter(r => r.status === 'OFFERED' && !r.passengerId);
            setIncomingDriverOffers(offers);
            setIncomingRequests([]);

            if (myActiveRide) {
              if ((myActiveRide.status === 'COMPLETED' || myActiveRide.status === 'FINISHED' || myActiveRide.status === 'CANCELLED') && myActiveRide.closedByPassenger) {
                setRide({ status: 'IDLE', pickup: '', destination: '', passengerId: null, driverId: null });
              } else {
                setRide(myActiveRide);
              }
            } else {
              setRide({ status: 'IDLE', pickup: '', destination: '', passengerId: null, driverId: null });
            }
          }

        } else {
          setStats({ activeDrivers: 0, activePassengers: 0 });
          setRide({
            status: 'IDLE',
            pickup: '',
            destination: '',
            passengerId: null,
            driverId: null,
          });
          setIncomingRequests([]);
          setIncomingDriverOffers([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // History Load
  useEffect(() => {
    if (!user || !isInitialized) return;
    let q;
    if (user.role === 'passenger') {
      q = query(collection(db, 'rides'), where('passengerId', '==', user.uid), where('status', 'in', ['COMPLETED', 'FINISHED', 'CANCELLED']));
    } else if (user.role === 'driver') {
      q = query(collection(db, 'rides'), where('driverId', '==', user.uid), where('status', 'in', ['COMPLETED', 'FINISHED', 'CANCELLED']));
    }

    if (q) {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyItems: RideHistoryItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          const dateObj = data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date();
          let duration = "N/A";
          if (data.startTime && data.endTime) {
            const start = (data.startTime as Timestamp).toDate().getTime();
            const end = (data.endTime as Timestamp).toDate().getTime();
            const diffMs = end - start;
            const diffMins = Math.floor(diffMs / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);
            duration = `${diffMins}m ${diffSecs}s`;
          }
          return {
            id: doc.id,
            date: dateObj.toLocaleDateString('tr-TR'),
            time: dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            pickup: data.pickup,
            destination: data.destination,
            status: data.status,
            passengerName: data.passengerName,
            driverName: data.driverName,
            timestamp: dateObj.getTime(),
            duration
          };
        });
        historyItems.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setHistory(historyItems);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Leaderboard
  useEffect(() => {
    if (!isInitialized) return;
    const q = query(collection(db, 'rides'), where('status', 'in', ['COMPLETED', 'FINISHED']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driverCounts: { [key: string]: { count: number, name: string } } = {};
      const passengerCounts: { [key: string]: { count: number, name: string } } = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const dName = data.driverName || 'Unknown Driver';
        const pName = data.passengerName || 'Unknown Passenger';
        const dId = data.driverId;
        const pId = data.passengerId;

        if (dId) {
          if (!driverCounts[dName]) driverCounts[dName] = { count: 0, name: dName };
          driverCounts[dName].count++;
        }
        if (pId) {
          if (!passengerCounts[pName]) passengerCounts[pName] = { count: 0, name: pName };
          passengerCounts[pName].count++;
        }
      });
      const topDrivers = Object.values(driverCounts).sort((a, b) => b.count - a.count).slice(0, 5);
      const topPassengers = Object.values(passengerCounts).sort((a, b) => b.count - a.count).slice(0, 5);
      setLeaderboard({ topDrivers, topPassengers });
    });
    return () => unsubscribe();
  }, []);

  const requestRide = async (pickup: string, destination: string, passengerName: string) => {
    if (!user) return;
    await addDoc(collection(db, 'rides'), {
      pickup,
      destination,
      passengerId: user.uid,
      passengerName,
      status: 'REQUESTED',
      driverId: null,
      declinedDriverIds: [],
      createdAt: serverTimestamp()
    });
  };

  const createRideByDriver = async (pickup: string, destination: string, driverName: string) => {
    if (!user) return;
    await addDoc(collection(db, 'rides'), {
      pickup,
      destination,
      driverId: user.uid,
      driverName,
      status: 'OFFERED',
      passengerId: null,
      createdAt: serverTimestamp()
    });
  };

  const joinRide = async (rideId: string, passengerId: string, passengerName: string) => {
    if (!rideId || !isInitialized) return;
    await updateDoc(doc(db, 'rides', rideId), {
      status: 'ACCEPTED',
      passengerId,
      passengerName
    });
  };

  const acceptRide = async (rideId: string, driverId: string, driverName: string) => {
    if (!rideId || !isInitialized) return;
    await updateDoc(doc(db, 'rides', rideId), {
      status: 'ACCEPTED',
      driverId,
      driverName
    });
  };

  const declineRide = async (rideId: string) => {
    if (!user || !rideId || !isInitialized) return;
    await updateDoc(doc(db, 'rides', rideId), {
      declinedDriverIds: arrayUnion(user.uid)
    });
  };

  const startRide = async () => {
    if (!ride.id || !isInitialized) return;
    await updateDoc(doc(db, 'rides', ride.id), {
      status: 'WAITING_FOR_PICKUP_CONFIRM'
    });
  };

  const confirmPickupByPassenger = async () => {
    if (!ride.id || !isInitialized) return;
    await updateDoc(doc(db, 'rides', ride.id), {
      status: 'ONGOING',
      startTime: serverTimestamp()
    });
  }

  const endRide = async () => {
    if (!ride.id || !isInitialized) return;
    await updateDoc(doc(db, 'rides', ride.id), {
      status: 'COMPLETED',
      endTime: serverTimestamp()
    });
  };

  const confirmDropoffByPassenger = async () => {
    if (!ride.id || !isInitialized) return;
    await updateDoc(doc(db, 'rides', ride.id), {
      status: 'COMPLETED',
      endTime: serverTimestamp()
    });
  }

  const cancelRide = async (rideId?: string) => {
    const targetRideId = rideId || ride.id;
    if (!targetRideId || !isInitialized) return;
    await updateDoc(doc(db, 'rides', targetRideId), {
      status: 'CANCELLED'
    });
  };

  const closeRide = async () => {
    if (!ride.id || !user || !isInitialized) return;
    const updateData: any = {};
    if (user.role === 'driver') updateData.closedByDriver = true;
    else updateData.closedByPassenger = true;
    await updateDoc(doc(db, 'rides', ride.id), updateData);
  };

  const resetRide = () => {
    setRide({
      status: 'IDLE',
      pickup: '',
      destination: '',
      passengerId: null,
      driverId: null,
    });
  };

  return (
    <RideContext.Provider value={{ ride, incomingRequests, incomingDriverOffers, history, leaderboard, stats, requestRide, createRideByDriver, joinRide, acceptRide, declineRide, startRide, confirmPickupByPassenger, endRide, confirmDropoffByPassenger, cancelRide, closeRide, resetRide }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRide() {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
}
