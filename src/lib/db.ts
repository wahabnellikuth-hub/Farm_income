import { ref, get, set, push, update, remove, child } from 'firebase/database';
import { db } from './firebase';
import type { Crop, Transaction } from '../types';

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

export async function updateCropDetails(cropId: string, details: { description?: string, pdfUrl?: string }) {
  const cropRef = ref(db, `${CROPS_COLLECTION}/${cropId}`);
  await update(cropRef, details);
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

export async function updateTransaction(transactionId: string, oldTx: Transaction, newTxData: Omit<Transaction, 'id' | 'userId' | 'cropId'>) {
  const txRef = ref(db, `${TRANSACTIONS_COLLECTION}/${transactionId}`);
  await update(txRef, newTxData);

  // Update crop totals
  const cropRef = ref(db, `${CROPS_COLLECTION}/${oldTx.cropId}`);
  const cropSnap = await get(cropRef);
  if (cropSnap.exists()) {
    const cropData = cropSnap.val() as Crop;
    let newTotalIncome = cropData.totalIncome || 0;
    let newTotalExpenses = cropData.totalExpenses || 0;

    // Reverse old
    if (oldTx.type === 'Income') {
      newTotalIncome -= oldTx.amount;
    } else {
      newTotalExpenses -= oldTx.amount;
    }

    // Apply new
    if (newTxData.type === 'Income') {
      newTotalIncome += newTxData.amount;
    } else {
      newTotalExpenses += newTxData.amount;
    }

    await update(cropRef, { totalIncome: newTotalIncome, totalExpenses: newTotalExpenses });
  }
}

// Clear all data
export async function clearDatabase(userId: string) {
  const dbRef = ref(db);
  
  // Clear Crops
  const cropsSnapshot = await get(child(dbRef, CROPS_COLLECTION));
  if (cropsSnapshot.exists()) {
    const cropsData = cropsSnapshot.val();
    for (const key of Object.keys(cropsData)) {
      if (cropsData[key].userId === userId) {
        await remove(ref(db, `${CROPS_COLLECTION}/${key}`));
      }
    }
  }

  // Clear Transactions
  const txSnapshot = await get(child(dbRef, TRANSACTIONS_COLLECTION));
  if (txSnapshot.exists()) {
    const txData = txSnapshot.val();
    for (const key of Object.keys(txData)) {
      if (txData[key].userId === userId) {
        await remove(ref(db, `${TRANSACTIONS_COLLECTION}/${key}`));
      }
    }
  }
}
