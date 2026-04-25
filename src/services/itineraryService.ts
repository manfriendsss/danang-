import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ItineraryData, DayPlan, ExpenseItem, QuickExpense } from '../types';
import { initialData } from '../data';

const TRIPS_COLLECTION = 'trips';

export const getTripsForUser = async (userId: string) => {
  const q = query(collection(db, TRIPS_COLLECTION), where("ownerId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const seedInitialData = async (userId: string) => {
  try {
    // Create main trip document
    const tripRef = doc(collection(db, TRIPS_COLLECTION));
    const tripId = tripRef.id;

    await setDoc(tripRef, {
      title: initialData.title,
      subtitle: initialData.subtitle,
      summary: initialData.summary,
      adultCount: 8,
      tripStatus: 'planning',
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Seed itinerary days
    const daysBatch = writeBatch(db);
    initialData.itinerary.forEach((day, index) => {
      const dayRef = doc(collection(db, `${TRIPS_COLLECTION}/${tripId}/days`));
      daysBatch.set(dayRef, { ...day, order: index });
    });
    await daysBatch.commit();

    // Seed planned expenses
    const expensesBatch = writeBatch(db);
    initialData.expenses.items.forEach((item, index) => {
      const expenseRef = doc(collection(db, `${TRIPS_COLLECTION}/${tripId}/expenses`));
      expensesBatch.set(expenseRef, { ...item, order: index });
    });
    await expensesBatch.commit();

    return tripId;
  } catch (error) {
    console.error("Error seeding initial data:", error);
    throw error;
  }
};

export const subscribeToTripData = (
  tripId: string, 
  callback: (data: Partial<ItineraryData>) => void
) => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  
  const unsubscribeTrip = onSnapshot(tripRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        title: data.title,
        subtitle: data.subtitle,
        summary: data.summary,
        adultCount: data.adultCount,
        tripStatus: data.tripStatus
      });
    }
  });

  const unsubscribeDays = onSnapshot(query(collection(db, `${TRIPS_COLLECTION}/${tripId}/days`)), (snapshot) => {
    const days = snapshot.docs.map(doc => doc.data() as DayPlan).sort((a: any, b: any) => a.order - b.order);
    callback({ itinerary: days });
  });

  const unsubscribeExpenses = onSnapshot(query(collection(db, `${TRIPS_COLLECTION}/${tripId}/expenses`)), (snapshot) => {
    const items = snapshot.docs.map(doc => doc.data() as ExpenseItem).sort((a: any, b: any) => a.order - b.order);
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const totalLabel = `${total.toLocaleString('vi-VN')}đ`;
    callback({ expenses: { items, totalLabel } });
  });

  const unsubscribeQuickExpenses = onSnapshot(query(collection(db, `${TRIPS_COLLECTION}/${tripId}/quickExpenses`)), (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuickExpense));
    callback({ quickExpenses: items });
  });

  return () => {
    unsubscribeTrip();
    unsubscribeDays();
    unsubscribeExpenses();
    unsubscribeQuickExpenses();
  };
};

export const addQuickExpense = async (tripId: string, expense: Omit<QuickExpense, 'id'>) => {
  const collectionRef = collection(db, `${TRIPS_COLLECTION}/${tripId}/quickExpenses`);
  return addDoc(collectionRef, {
    ...expense,
    createdAt: serverTimestamp()
  });
};

export const removeQuickExpense = async (tripId: string, expenseId: string) => {
  const docRef = doc(db, `${TRIPS_COLLECTION}/${tripId}/quickExpenses`, expenseId);
  return deleteDoc(docRef);
};

export const updateAllExpenses = async (tripId: string, expenses: ExpenseItem[]) => {
  const collectionRef = collection(db, `${TRIPS_COLLECTION}/${tripId}/expenses`);
  const snapshot = await getDocs(collectionRef);
  
  const batch = writeBatch(db);
  // Delete old ones
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  
  // Add new ones
  expenses.forEach((item, index) => {
    const docRef = doc(collection(db, `${TRIPS_COLLECTION}/${tripId}/expenses`));
    batch.set(docRef, { ...item, order: index });
  });
  
  await batch.commit();
};

export const updateTrip = async (tripId: string, updates: Partial<any>) => {
  const docRef = doc(db, TRIPS_COLLECTION, tripId);
  return setDoc(docRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
};
