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
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [tripData, setTripData] = useState<ItineraryData | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const trips = await getTripsForUser(user.uid);
        let currentTripId = trips.length > 0 ? trips[0].id : null;
        
        if (!currentTripId) {
          currentTripId = await seedInitialData(user.uid);
        }
        setTripId(currentTripId);
      } else {
        setTripId(null);
        setTripData(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (tripId) {
      const unsubscribeTrip = subscribeToTripData(tripId, (update) => {
        setTripData(prev => {
          const newData = {
            ...initialData,
            ...(prev || {}),
            ...update
          } as ItineraryData;
          return newData;
        });
      });
      return () => unsubscribeTrip();
    }
  }, [tripId]);

  const login = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
  };

  const addExpense = async (expense: Omit<QuickExpense, 'id'>) => {
    if (tripId) {
      await firebaseAddQuickExpense(tripId, expense);
    }
  };

  const removeExpense = async (expenseId: string) => {
    if (tripId) {
      await firebaseRemoveQuickExpense(tripId, expenseId);
    }
  };

  const resetExpensesToDefault = async () => {
    if (tripId) {
      await firebaseUpdateAllExpenses(tripId, initialData.expenses.items);
      // Also update the summary total
      await firebaseUpdateTrip(tripId, { 
        summary: initialData.summary,
        title: initialData.title,
        subtitle: initialData.subtitle
      });
    }
  };

  const setAdultCount = async (count: number) => {
    if (tripId) {
      await firebaseUpdateTrip(tripId, { adultCount: count });
    }
  };

  const setTripStatus = async (status: 'planning' | 'ongoing' | 'finished') => {
    if (tripId) {
      await firebaseUpdateTrip(tripId, { tripStatus: status });
    }
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
      setTripStatus
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
