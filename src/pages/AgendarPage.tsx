import { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import {
  crearVisita,
  getDiasBloqueados,
  getDiasConVisitas,
  getConfig,
  type DiaBloqueado,
} from '@/services/visitasService';

type ValuePiece = Date | null;

export default function AgendarPage() {
  const [selectedDate, setSelectedDate] = useState<ValuePiece>(null);
  const [diasBloqueados, setDiasBloqueados] = useState<DiaBloqueado[]>([]);
  const [diasConVisitas, setDiasConVisitas] = useState<Map<string, number>>(new Map());
  const [maxVisitas, setMaxVisitas] = useState(2);
  const [bloquesHorarios, setBloquesHorarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [form, setForm] = useState({
    nombre_voluntario: '',
    telefono: '',
    bloque_horario: '',
    actividad_a_realizar: '',
  });

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const loadData = useCallback(async () => {
    try {
      const [bloqueados, config] = await Promise.all([
        getDiasBloqueados(),
        getConfig(),
      ]);
      setDiasBloqueados(bloqueados);
      setMaxVisitas(config.max_visitas_por_dia || 2);
      setBloquesHorarios(config.bloques_horarios || ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM']);
      if (config.bloques_horarios?.length) {
        setForm((f) => ({ ...f, bloque_horario: config.bloques_horarios[0] }));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  const loadMonthVisitas = useCallback(async (date: Date) => {
    try {
      const visitas = await getDiasConVisitas(date.getMonth() + 1, date.getFullYear());
      setDiasConVisitas(visitas);
    } catch (err) {
      console.error('Error loading month visitas:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadMonthVisitas(activeMonth);
  }, [loadData, loadMonthVisitas, activeMonth]);

  const isDateBlocked = (date: Date) => {
    const dateStr = formatDate(date);
    return diasBloqueados.some((d) => d.fecha === dateStr);
  };

  const isDateFull = (date: Date) => {
    const dateStr = formatDate(date);
    return (diasConVisitas.get(dateStr) || 0) >= maxVisitas;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || isDateBlocked(date) || isDateFull(date);
  };

  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return '';
    if (isDateBlocked(date)) return 'dia-bloqueado';
    if (isDateFull(date)) return 'dia-lleno';
    return 'dia-disponible';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error('Selecciona una fecha en el calendario');
      return;
    }
    setLoading(true);
    try {
      await crearVisita({
        ...form,
        fecha: formatDate(selectedDate),
      });
      setSuccess(true);
      toast.success('¡Visita agendada exitosamente!');
      setForm({ nombre_voluntario: '', telefono: '', bloque_horario: bloquesHorarios[0] || '', actividad_a_realizar: '' });
      setSelectedDate(null);
      loadMonthVisitas(activeMonth);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al agendar la visita';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center shadow-lg animate-fade-in">
          <div className="w-20 h-20 bg-verde-light rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-verde" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="font-heading text-2xl font-bold text-azul mb-3">¡Visita Confirmada!</h2>
          <p className="text-gris-texto mb-8">Tu visita ha sido registrada exitosamente. Te esperamos en Azul Wasi.</p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-azul hover:bg-azul-dark text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
          >
            Agendar otra visita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fondo">
      {/* Header */}
      <div className="bg-gradient-to-r from-azul to-azul-dark text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3 animate-fade-in">Agenda tu Visita</h1>
          <p className="text-white/80 text-lg max-w-2xl animate-fade-in">Selecciona un día disponible en el calendario y completa el formulario para agendar tu visita al albergue.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded-md bg-verde-light border border-verde/30"></span>
            <span className="text-gris-texto">Disponible</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded-md bg-[#f1f5f9] border border-gray-300"></span>
            <span className="text-gris-texto">Completo</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded-md bg-rojo-light border border-rojo/30"></span>
            <span className="text-gris-texto">Bloqueado</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="animate-slide-up">
            <Calendar
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate}
              tileDisabled={({ date }) => isDateDisabled(date)}
              tileClassName={getTileClassName}
              onActiveStartDateChange={({ activeStartDate }) => {
                if (activeStartDate) setActiveMonth(activeStartDate);
              }}
              minDate={new Date()}
              locale="es-ES"
              className="!border-0 !shadow-lg !rounded-2xl"
            />
            {selectedDate && (
              <div className="mt-4 bg-azul-light rounded-xl p-4 animate-fade-in">
                <p className="text-azul font-semibold text-sm">
                  📅 Fecha seleccionada: {selectedDate.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gris-borde">
              <h2 className="font-heading text-xl font-bold text-azul mb-6">Datos del Voluntario</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={form.nombre_voluntario}
                    onChange={(e) => setForm({ ...form, nombre_voluntario: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-azul focus:ring-2 focus:ring-azul/10 outline-none transition-all text-sm"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-azul focus:ring-2 focus:ring-azul/10 outline-none transition-all text-sm"
                    placeholder="999 999 999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bloque horario *</label>
                  <select
                    required
                    value={form.bloque_horario}
                    onChange={(e) => setForm({ ...form, bloque_horario: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-azul focus:ring-2 focus:ring-azul/10 outline-none transition-all text-sm bg-white"
                  >
                    {bloquesHorarios.map((bloque) => (
                      <option key={bloque} value={bloque}>{bloque}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actividad a realizar *</label>
                  <textarea
                    required
                    value={form.actividad_a_realizar}
                    onChange={(e) => setForm({ ...form, actividad_a_realizar: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-azul focus:ring-2 focus:ring-azul/10 outline-none transition-all text-sm resize-none"
                    rows={3}
                    placeholder="Describe brevemente la actividad que realizarás (ej. apoyo en tareas escolares, recreación, etc.)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedDate}
                  className="w-full bg-verde hover:bg-verde-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-verde/25 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Agendando...</>
                  ) : (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Confirmar agendamiento</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
