import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface Donacion {
  id?: string;
  nombre_donante: string;
  monto: number;
  metodo: 'Yape' | 'Plin' | 'Transferencia';
  boucher_url?: string;
  fecha: Timestamp;
  mensaje?: string;
}

const DONACIONES_COLLECTION = 'donaciones';

export async function registrarDonacion(
  datos: Omit<Donacion, 'id' | 'fecha' | 'boucher_url'>,
  archivo?: File
): Promise<string> {
  let boucher_url: string | undefined;

  if (archivo) {
    const fileName = `bouchers/${Date.now()}_${archivo.name}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, archivo);
    boucher_url = await getDownloadURL(snapshot.ref);
  }

  const docRef = await addDoc(collection(db, DONACIONES_COLLECTION), {
    ...datos,
    boucher_url,
    fecha: Timestamp.now(),
  });

  return docRef.id;
}

export async function getDonaciones(maxResults = 50): Promise<Donacion[]> {
  const q = query(
    collection(db, DONACIONES_COLLECTION),
    orderBy('fecha', 'desc'),
    limit(maxResults)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Donacion));
}

export async function getDonacionesPorMes(): Promise<Map<string, number>> {
  const donaciones = await getDonaciones(200);
  const map = new Map<string, number>();
  
  donaciones.forEach((d) => {
    const date = d.fecha.toDate();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + d.monto);
  });

  return map;
}

export async function getTotalDonaciones(): Promise<number> {
  const donaciones = await getDonaciones(500);
  return donaciones.reduce((total, d) => total + d.monto, 0);
}
