import { collection, doc, getDocs, setDoc, query, where, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { mockCrops, mockTransactions } from '../data/mockData';
import type { Crop, Transaction } from '../data/mockData';

const CROPS_COLLECTION = 'crops';
const TRANSACTIONS_COLLECTION = 'transactions';

// Crops
export async function getCrops(userId: string): Promise<Crop[]> {
  const q = query(collection(db, CROPS_COLLECTION), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Crop));
}

export async function addCrop(userId: string, crop: Omit<Crop, 'id'>) {
  const docRef = doc(collection(db, CROPS_COLLECTION));
  await setDoc(docRef, { ...crop, userId, id: docRef.id });
  return docRef.id;
}

export async function updateCropTarget(cropId: string, targetIncome: number) {
  const docRef = doc(db, CROPS_COLLECTION, cropId);
  await updateDoc(docRef, { targetIncome });
}

// Transactions
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const q = query(collection(db, TRANSACTIONS_COLLECTION), where("userId", "==", userId), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
}

export async function addTransaction(userId: string, transaction: Omit<Transaction, 'id'>) {
  const docRef = doc(collection(db, TRANSACTIONS_COLLECTION));
  
  // Create transaction
  await setDoc(docRef, { ...transaction, userId, id: docRef.id });
  
  // Update crop totals
  const cropRef = doc(db, CROPS_COLLECTION, transaction.cropId);
  const cropSnap = await getDocs(query(collection(db, CROPS_COLLECTION), where("id", "==", transaction.cropId)));
  if (!cropSnap.empty) {
    const cropData = cropSnap.docs[0].data() as Crop;
    if (transaction.type === 'Income') {
      await updateDoc(cropRef, { totalIncome: cropData.totalIncome + transaction.amount });
    } else {
      await updateDoc(cropRef, { totalExpenses: cropData.totalExpenses + transaction.amount });
    }
  }

  return docRef.id;
}

export async function deleteTransaction(transaction: Transaction) {
  await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, transaction.id));

  // Reverse crop totals
  const cropRef = doc(db, CROPS_COLLECTION, transaction.cropId);
  const cropSnap = await getDocs(query(collection(db, CROPS_COLLECTION), where("id", "==", transaction.cropId)));
  if (!cropSnap.empty) {
    const cropData = cropSnap.docs[0].data() as Crop;
    if (transaction.type === 'Income') {
      await updateDoc(cropRef, { totalIncome: cropData.totalIncome - transaction.amount });
    } else {
      await updateDoc(cropRef, { totalExpenses: cropData.totalExpenses - transaction.amount });
    }
  }
}

// Seeder
export async function seedDatabase(userId: string) {
  // Add mock crops
  for (const crop of mockCrops) {
    await setDoc(doc(db, CROPS_COLLECTION, crop.id), { ...crop, userId });
  }

  // Add mock transactions
  for (const tx of mockTransactions) {
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, tx.id), { ...tx, userId });
  }
}
