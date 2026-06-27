import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Donacion {
  id?: string;
  nombre_donante: string;
  monto: number;
  metodo: 'Yape' | 'Plin' | 'Transferencia';
  boucher_url?: string; // We'll store the base64 compressed data here
  fecha: Timestamp;
  mensaje?: string;
}

const DONACIONES_COLLECTION = 'donaciones';

// Helper function to compress images client-side to prevent Firestore document size limit issues (1MB max)
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600; // Keep it small
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // 50% quality JPEG is usually ~20-40KB
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export async function registrarDonacion(
  datos: Omit<Donacion, 'id' | 'fecha' | 'boucher_url'>,
  archivo?: File
): Promise<string> {
  let boucher_url: string | undefined;

  if (archivo) {
    try {
      boucher_url = await compressImage(archivo);
    } catch (err) {
      console.error('Error compressing image:', err);
    }
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
