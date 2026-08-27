import { ref, get, set, push, update, remove, child } from 'firebase/database';
import { db } from './firebase';
import { mockCrops, mockTransactions } from '../data/mockData';
import type { Crop, Transaction } from '../data/mockData';

const CROPS_COLLECTION = 'crops';
const TRANSACTIONS_COLLECTION = 'transactions';

// Crops
export async function getCrops(userId: string): Promise<Crop[]> {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `${CROPS_COLLECTION}`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    const crops = Object.keys(data).map(key => ({ id: key, ...data[key] } as Crop & { userId: string }));
    return crops.filter(c => c.userId === userId);
  }
  return [];
}

export async function addCrop(userId: string, crop: Omit<Crop, 'id'>) {
  const cropListRef = ref(db, CROPS_COLLECTION);
  const newCropRef = push(cropListRef);
  await set(newCropRef, { ...crop, userId });
  return newCropRef.key as string;
}

export async function updateCropTarget(cropId: string, targetIncome: number) {
  const cropRef = ref(db, `${CROPS_COLLECTION}/${cropId}`);
  await update(cropRef, { targetIncome });
}

// Transactions
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `${TRANSACTIONS_COLLECTION}`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    let txs = Object.keys(data).map(key => ({ id: key, ...data[key] } as Transaction & { userId: string }));
    txs = txs.filter(t => t.userId === userId);
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return [];
}

export async function addTransaction(userId: string, transaction: Omit<Transaction, 'id'>) {
  const txListRef = ref(db, TRANSACTIONS_COLLECTION);
  const newTxRef = push(txListRef);
  await set(newTxRef, { ...transaction, userId });
  
  // Update crop totals
  const cropRef = ref(db, `${CROPS_COLLECTION}/${transaction.cropId}`);
  const cropSnap = await get(cropRef);
  if (cropSnap.exists()) {
    const cropData = cropSnap.val() as Crop;
    if (transaction.type === 'Income') {
      await update(cropRef, { totalIncome: (cropData.totalIncome || 0) + transaction.amount });
    } else {
      await update(cropRef, { totalExpenses: (cropData.totalExpenses || 0) + transaction.amount });
    }
  }

  return newTxRef.key as string;
}

export async function deleteTransaction(transaction: Transaction) {
  await remove(ref(db, `${TRANSACTIONS_COLLECTION}/${transaction.id}`));

  // Reverse crop totals
  const cropRef = ref(db, `${CROPS_COLLECTION}/${transaction.cropId}`);
  const cropSnap = await get(cropRef);
  if (cropSnap.exists()) {
    const cropData = cropSnap.val() as Crop;
    if (transaction.type === 'Income') {
      await update(cropRef, { totalIncome: (cropData.totalIncome || 0) - transaction.amount });
    } else {
      await update(cropRef, { totalExpenses: (cropData.totalExpenses || 0) - transaction.amount });
    }
  }
}

// Seeder
export async function seedDatabase(userId: string) {
  // Add mock crops
  const cropsRef = ref(db, CROPS_COLLECTION);
  for (const crop of mockCrops) {
    const cropData = { ...crop, userId };
    delete (cropData as any).id; // We use the ID as the key
    await set(child(cropsRef, crop.id), cropData);
  }

  // Add mock transactions
  const txsRef = ref(db, TRANSACTIONS_COLLECTION);
  for (const tx of mockTransactions) {
    const txData = { ...tx, userId };
    delete (txData as any).id; // We use the ID as the key
    await set(child(txsRef, tx.id), txData);
  }
}
