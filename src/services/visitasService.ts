import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Visita {
  id?: string;
  nombre_voluntario: string;
  telefono: string;
  fecha: string; // YYYY-MM-DD
  bloque_horario: string;
  actividad_a_realizar: string;
  estado: 'Confirmado' | 'Cancelado';
  created_at?: Timestamp;
}

export interface DiaBloqueado {
  id?: string;
  fecha: string; // YYYY-MM-DD
  motivo: string;
}

const VISITAS_COLLECTION = 'visitas';
const DIAS_BLOQUEADOS_COLLECTION = 'dias_bloqueados';
const CONFIG_COLLECTION = 'configuracion';

export async function getConfig() {
  const configRef = doc(db, CONFIG_COLLECTION, 'general');
  const { getDoc } = await import('firebase/firestore');
  const configSnap = await getDoc(configRef);
  if (configSnap.exists()) {
    return configSnap.data();
  }
  // Default config
  return {
    max_visitas_por_dia: 2,
    bloques_horarios: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'],
  };
}

export async function getVisitasPorFecha(fecha: string): Promise<Visita[]> {
  const q = query(
    collection(db, VISITAS_COLLECTION),
    where('fecha', '==', fecha),
    where('estado', '==', 'Confirmado')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Visita));
}

export async function contarVisitasPorFecha(fecha: string): Promise<number> {
  const visitas = await getVisitasPorFecha(fecha);
  return visitas.length;
}

export async function crearVisita(datos: Omit<Visita, 'id' | 'estado' | 'created_at'>): Promise<string> {
  const config = await getConfig();
  const count = await contarVisitasPorFecha(datos.fecha);

  if (count >= (config.max_visitas_por_dia || 2)) {
    throw new Error('Este día ya alcanzó el límite máximo de visitas. Por favor, selecciona otro día.');
  }

  // Check if day is blocked
  const bloqueados = await getDiasBloqueados();
  if (bloqueados.some((d) => d.fecha === datos.fecha)) {
    throw new Error('Este día está bloqueado y no acepta visitas.');
  }

  const docRef = await addDoc(collection(db, VISITAS_COLLECTION), {
    ...datos,
    estado: 'Confirmado',
    created_at: Timestamp.now(),
  });

  return docRef.id;
}

export async function getDiasBloqueados(): Promise<DiaBloqueado[]> {
  const snapshot = await getDocs(collection(db, DIAS_BLOQUEADOS_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DiaBloqueado));
}

export async function bloquearDia(fecha: string, motivo: string): Promise<string> {
  const docRef = await addDoc(collection(db, DIAS_BLOQUEADOS_COLLECTION), {
    fecha,
    motivo,
  });
  return docRef.id;
}

export async function desbloquearDia(id: string): Promise<void> {
  await deleteDoc(doc(db, DIAS_BLOQUEADOS_COLLECTION, id));
}

export async function getVisitasSemana(startDate: string, endDate: string): Promise<Visita[]> {
  const q = query(
    collection(db, VISITAS_COLLECTION),
    where('fecha', '>=', startDate),
    where('fecha', '<=', endDate),
    orderBy('fecha', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Visita));
}

export async function cancelarVisita(id: string): Promise<void> {
  const { updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, VISITAS_COLLECTION, id), { estado: 'Cancelado' });
}

export async function getDiasConVisitas(mes: number, anio: number): Promise<Map<string, number>> {
  const startDate = `${anio}-${String(mes).padStart(2, '0')}-01`;
  const endDay = new Date(anio, mes, 0).getDate();
  const endDate = `${anio}-${String(mes).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  const q = query(
    collection(db, VISITAS_COLLECTION),
    where('fecha', '>=', startDate),
    where('fecha', '<=', endDate),
    where('estado', '==', 'Confirmado')
  );
  const snapshot = await getDocs(q);
  const map = new Map<string, number>();
  snapshot.docs.forEach((d) => {
    const fecha = d.data().fecha;
    map.set(fecha, (map.get(fecha) || 0) + 1);
  });
  return map;
}
