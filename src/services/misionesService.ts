import { supabase } from '@/lib/supabase';

export type CategoriaMision = 'Educación' | 'Psicología' | 'Arte' | 'Recreación';

export interface Mision {
  id?: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaMision;
  fecha: string; // YYYY-MM-DD
  hora: string;
  cupos_totales: number;
  cupos_disponibles: number;
}

export interface ReservaMision {
  id?: string;
  mision_id: string;
  usuario_id: string;
  fecha_reserva: string;
}

const MISIONES_COLLECTION = 'misiones';
const RESERVAS_COLLECTION = 'reservas_misiones';

// Seed initial data if empty (for prototype purposes)
export async function seedMisionesMock() {
  const { data, error } = await supabase.from(MISIONES_COLLECTION).select('id').limit(1);
  
  // If table doesn't exist or is empty
  if (error || !data || data.length === 0) {
    const today = new Date();
    const days = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const mockMisiones: Omit<Mision, 'id'>[] = [
      { titulo: 'Reforzamiento de Matemáticas', descripcion: 'Apoyo en álgebra básica', categoria: 'Educación', fecha: days[0], hora: '3:00 PM', cupos_totales: 5, cupos_disponibles: 3 },
      { titulo: 'Sesión de Acompañamiento', descripcion: 'Apoyo emocional individual', categoria: 'Psicología', fecha: days[1], hora: '2:00 PM', cupos_totales: 2, cupos_disponibles: 1 },
      { titulo: 'Clase de Guitarra', descripcion: 'Nivel principiante', categoria: 'Arte', fecha: days[2], hora: '3:30 PM', cupos_totales: 4, cupos_disponibles: 4 },
      { titulo: 'Taller de Pintura', descripcion: 'Arte con acuarelas', categoria: 'Arte', fecha: days[3], hora: '4:00 PM', cupos_totales: 5, cupos_disponibles: 5 },
      { titulo: 'Fútbol y Juegos', descripcion: 'Recreación deportiva', categoria: 'Recreación', fecha: days[4], hora: '10:00 AM', cupos_totales: 10, cupos_disponibles: 6 },
      { titulo: 'Creación de Contenido', descripcion: 'Videos y fotografía', categoria: 'Recreación', fecha: days[4], hora: '2:00 PM', cupos_totales: 5, cupos_disponibles: 3 },
    ];

    try {
      await supabase.from(MISIONES_COLLECTION).insert(mockMisiones);
    } catch (e) {
      console.error("Error seeding:", e);
    }
  }
}

export async function getMisionesDelDia(fecha: string): Promise<Mision[]> {
  const { data, error } = await supabase
    .from(MISIONES_COLLECTION)
    .select('*')
    .eq('fecha', fecha);
    
  if (error) throw error;
  return data as Mision[];
}

export async function getMisReservas(usuario_id: string): Promise<ReservaMision[]> {
  if (!usuario_id) return [];
  const { data, error } = await supabase
    .from(RESERVAS_COLLECTION)
    .select('*')
    .eq('usuario_id', usuario_id);
    
  if (error) throw error;
  return data as ReservaMision[];
}

export async function getMisionesSemana(startDate: string, endDate: string): Promise<Mision[]> {
  const { data, error } = await supabase
    .from(MISIONES_COLLECTION)
    .select('*')
    .gte('fecha', startDate)
    .lte('fecha', endDate);
    
  if (error) throw error;
  return data as Mision[];
}

export async function asumirMision(mision_id: string, usuario_id: string, cuposActuales: number): Promise<void> {
  if (cuposActuales <= 0) throw new Error('No hay cupos disponibles');

  // Decrement cupos
  const { error: updateError } = await supabase
    .from(MISIONES_COLLECTION)
    .update({ cupos_disponibles: cuposActuales - 1 })
    .eq('id', mision_id);
    
  if (updateError) throw updateError;

  // Register reservation
  const { error: insertError } = await supabase
    .from(RESERVAS_COLLECTION)
    .insert([{
      mision_id,
      usuario_id,
      fecha_reserva: new Date().toISOString()
    }]);
    
  if (insertError) {
    // Si falla la inserción, teóricamente deberíamos revertir los cupos (transacción). 
    // Por simplicidad en el cliente, mostramos el error.
    throw insertError;
  }
}
