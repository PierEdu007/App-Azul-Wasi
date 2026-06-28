import { supabase } from '@/lib/supabase';

export interface Visita {
  id?: string;
  nombre_voluntario: string;
  telefono: string;
  fecha: string; // YYYY-MM-DD
  bloque_horario: string;
  actividad_a_realizar: string;
  estado: 'Confirmado' | 'Cancelado';
  created_at?: string;
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
  const { data, error } = await supabase
    .from(CONFIG_COLLECTION)
    .select('*')
    .eq('id', 'general')
    .single();

  if (data && !error) {
    return data;
  }
  // Default config
  return {
    max_visitas_por_dia: 2,
    bloques_horarios: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'],
  };
}

export async function getVisitasPorFecha(fecha: string): Promise<Visita[]> {
  const { data, error } = await supabase
    .from(VISITAS_COLLECTION)
    .select('*')
    .eq('fecha', fecha)
    .eq('estado', 'Confirmado');
    
  if (error) throw error;
  return data as Visita[];
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

  const { data, error } = await supabase
    .from(VISITAS_COLLECTION)
    .insert([{
      ...datos,
      estado: 'Confirmado',
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getDiasBloqueados(): Promise<DiaBloqueado[]> {
  const { data, error } = await supabase
    .from(DIAS_BLOQUEADOS_COLLECTION)
    .select('*');
    
  if (error) throw error;
  return data as DiaBloqueado[];
}

export async function bloquearDia(fecha: string, motivo: string): Promise<string> {
  const { data, error } = await supabase
    .from(DIAS_BLOQUEADOS_COLLECTION)
    .insert([{ fecha, motivo }])
    .select('id')
    .single();
    
  if (error) throw error;
  return data.id;
}

export async function desbloquearDia(id: string): Promise<void> {
  const { error } = await supabase
    .from(DIAS_BLOQUEADOS_COLLECTION)
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

export async function getVisitasSemana(startDate: string, endDate: string): Promise<Visita[]> {
  const { data, error } = await supabase
    .from(VISITAS_COLLECTION)
    .select('*')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .order('fecha', { ascending: true });
    
  if (error) throw error;
  return data as Visita[];
}

export async function cancelarVisita(id: string): Promise<void> {
  const { error } = await supabase
    .from(VISITAS_COLLECTION)
    .update({ estado: 'Cancelado' })
    .eq('id', id);
    
  if (error) throw error;
}

export async function getDiasConVisitas(mes: number, anio: number): Promise<Map<string, number>> {
  const startDate = `${anio}-${String(mes).padStart(2, '0')}-01`;
  const endDay = new Date(anio, mes, 0).getDate();
  const endDate = `${anio}-${String(mes).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from(VISITAS_COLLECTION)
    .select('fecha')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .eq('estado', 'Confirmado');
    
  if (error) throw error;

  const map = new Map<string, number>();
  data.forEach((d) => {
    map.set(d.fecha, (map.get(d.fecha) || 0) + 1);
  });
  return map;
}
