import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { 
  getTripsForUser, 
  seedInitialData, 
  subscribeToTripData,
  addQuickExpense as firebaseAddQuickExpense,
  removeQuickExpense as firebaseRemoveQuickExpense,
  updateTrip as firebaseUpdateTrip,
  updateAllExpenses as firebaseUpdateAllExpenses
} from '../services/itineraryService';
import { ItineraryData, QuickExpense } from '../types';
import { initialData } from '../data';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  tripData: ItineraryData | null;
  tripId: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addExpense: (expense: Omit<QuickExpense, 'id'>) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
  resetExpensesToDefault: () => Promise<void>;
  setAdultCount: (count: number) => void;
  setTripStatus: (status: 'planning' | 'ongoing' | 'finished') => void;
  updateTripData: (newData: ItineraryData) => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [remoteTripData, setRemoteTripData] = useState<Partial<ItineraryData> | null>(null);
  const [localTripData, setLocalTripData] = useState<ItineraryData>(initialData);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const trips = await getTripsForUser(user.uid);
          let currentTripId = trips.length > 0 ? trips[0].id : null;
          
          if (!currentTripId) {
            currentTripId = await seedInitialData(user.uid);
          }
          setTripId(currentTripId);
        } catch (err) {
          console.error("Auth sync error", err);
        }
      } else {
        setTripId(null);
        setRemoteTripData(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (tripId) {
      const unsubscribeTrip = subscribeToTripData(tripId, (update) => {
        setRemoteTripData(prev => ({ ...(prev || {}), ...update }));
      });
      return () => unsubscribeTrip();
    }
  }, [tripId]);

  // Derived data with priority: Remote > Local
  const tripData: ItineraryData = {
    ...localTripData,
    ...(remoteTripData || {})
  } as ItineraryData;

  const login = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
  };

  const addExpense = async (expense: Omit<QuickExpense, 'id'>) => {
    if (tripId) {
      await firebaseAddQuickExpense(tripId, expense);
    } else {
      const newExpense = { ...expense, id: Date.now().toString() };
      setLocalTripData(prev => ({
        ...prev,
        quickExpenses: [...(prev.quickExpenses || []), newExpense]
      }));
    }
  };

  const removeExpense = async (expenseId: string) => {
    if (tripId) {
      await firebaseRemoveQuickExpense(tripId, expenseId);
    } else {
      setLocalTripData(prev => ({
        ...prev,
        quickExpenses: (prev.quickExpenses || []).filter(e => e.id !== expenseId)
      }));
    }
  };

  const resetExpensesToDefault = async () => {
    if (tripId) {
      await firebaseUpdateAllExpenses(tripId, initialData.expenses.items);
      await firebaseUpdateTrip(tripId, { 
        summary: initialData.summary,
        title: initialData.title,
        subtitle: initialData.subtitle
      });
    } else {
      // For local, we just reset the whole state to initial
      setLocalTripData(initialData);
    }
  };

  const setAdultCount = async (count: number) => {
    if (tripId) {
      await firebaseUpdateTrip(tripId, { adultCount: count });
    } else {
      setLocalTripData(prev => ({ ...prev, adultCount: count }));
    }
  };

  const setTripStatus = async (status: 'planning' | 'ongoing' | 'finished') => {
    if (tripId) {
      await firebaseUpdateTrip(tripId, { tripStatus: status });
    } else {
      setLocalTripData(prev => ({ ...prev, tripStatus: status }));
    }
  };

  const updateTripDataFromAI = async (newData: ItineraryData) => {
    if (tripId) {
      // In a real app we'd deep diff and update specifically
      // But for now let's update some metadata
      await firebaseUpdateTrip(tripId, {
        title: newData.title,
        subtitle: newData.subtitle,
        adultCount: newData.adultCount,
        tripStatus: newData.tripStatus
      });
      // We could also batch update expenses if they changed
    }
    setLocalTripData(newData);
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      loading, 
      tripData, 
      tripId,
      login, 
      logout: handleLogout,
      addExpense,
      removeExpense,
      resetExpensesToDefault,
      setAdultCount,
      setTripStatus,
      updateTripData: updateTripDataFromAI
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
