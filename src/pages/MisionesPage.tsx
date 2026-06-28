import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getMisionesSemana,
  getMisReservas, 
  asumirMision, 
  type Mision, 
  type ReservaMision 
} from '@/services/misionesService';
import { CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper colors
const misionColors: Record<string, { bg: string, text: string, light: string }> = {
  'Educación': { bg: 'bg-verde', text: 'text-verde', light: 'bg-verde-light' },
  'Psicología': { bg: 'bg-azul', text: 'text-azul', light: 'bg-azul-light' },
  'Arte': { bg: 'bg-naranja', text: 'text-naranja', light: 'bg-naranja-light' },
  'Recreación': { bg: 'bg-rojo', text: 'text-rojo', light: 'bg-rojo-light' },
};

const diasSemana = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export default function MisionesPage() {
  const { user, userData } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  const [misionesHoy, setMisionesHoy] = useState<Mision[]>([]);
  const [misionesSemana, setMisionesSemana] = useState<Mision[]>([]);
  const [misReservas, setMisReservas] = useState<ReservaMision[]>([]);

  const [misionToAssume, setMisionToAssume] = useState<Mision | null>(null);
  const [showSuccess, setShowSuccess] = useState<Mision | null>(null);
  const [formData, setFormData] = useState({ nombres: '', correo: '', edad: '' });

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Asegurar que sea inicio del día local
    
    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    // Generar solo 6 días (Lunes a Sábado)
    const week = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
    setWeekDates(week);
    
    // Si hoy es domingo (0), el week.some no lo encontrará y seleccionará el lunes.
    const isTodayInWeek = week.some(d => d.getTime() === today.getTime());
    setSelectedDate(isTodayInWeek ? today : monday);
  }, []);

  // Helper para obtener YYYY-MM-DD en hora local
  const getLocalDateString = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (user && weekDates.length > 0) {
      fetchData();
    }
  }, [user, weekDates]);

  useEffect(() => {
    // Filter misiones for today from the week's data using local date string
    const dateStr = getLocalDateString(selectedDate);
    setMisionesHoy(misionesSemana.filter(m => m.fecha === dateStr));
  }, [selectedDate, misionesSemana]);

  const fetchData = async () => {
    if (!user || weekDates.length === 0) return;
    try {
      const startStr = getLocalDateString(weekDates[0]);
      const endStr = getLocalDateString(weekDates[5]); // Sábado
      
      const [semana, reservas] = await Promise.all([
        getMisionesSemana(startStr, endStr),
        getMisReservas(user.uid)
      ]);
      setMisionesSemana(semana);
      setMisReservas(reservas);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos');
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group ALL missions by date to color the calendar
  const misionesPorFecha = useMemo(() => {
    const map = new Map<string, Mision[]>();
    misionesSemana.forEach(m => {
      const arr = map.get(m.fecha) || [];
      arr.push(m);
      map.set(m.fecha, arr);
    });
    return map;
  }, [misionesSemana]);

  // Group ASSUMED missions by date to color the calendar
  const reservasPorFecha = useMemo(() => {
    const map = new Map<string, Mision[]>();
    misReservas.forEach(r => {
      const mision = misionesSemana.find(m => m.id === r.mision_id);
      if (mision) {
        const arr = map.get(mision.fecha) || [];
        arr.push(mision);
        map.set(mision.fecha, arr);
      }
    });
    return map;
  }, [misReservas, misionesSemana]);

  const handleOpenAssume = (mision: Mision) => {
    setMisionToAssume(mision);
    setFormData({
      nombres: userData?.nombres || '',
      correo: userData?.email || '',
      edad: userData?.edad?.toString() || ''
    });
  };

  const handleConfirmAssume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!misionToAssume || !user) return;
    
    try {
      await asumirMision(misionToAssume.id!, user.uid, misionToAssume.cupos_disponibles);
      setShowSuccess(misionToAssume);
      setMisionToAssume(null);
      fetchData(); 
    } catch (err: any) {
      toast.error(err.message || 'Error al asumir la misión');
    }
  };

  const handleDayClick = (date: Date, dateStr: string) => {
    setSelectedDate(date);
    const assumedMisiones = reservasPorFecha.get(dateStr) || [];
    if (assumedMisiones.length > 0) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-fondo pb-24 flex flex-col">
      {/* Header específico de Misiones */}
      <header className="bg-azul text-white pt-6 pb-4 px-5 sticky top-0 z-50 rounded-b-[32px] shadow-sm mb-6">
        <h1 className="text-3xl font-bold font-heading">Azul Connect</h1>
        <p className="text-white/80 text-sm mt-1">Conectando corazones, transformando vidas</p>
      </header>

      {/* Scrollable Calendar */}
      <div className="bg-white p-4 shadow-sm mb-6 rounded-3xl mx-2">
        <h2 className="font-heading font-bold text-lg mb-3">Calendario Semanal</h2>
        
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
          {weekDates.map((date, i) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dateStr = getLocalDateString(date);
            const assumedMisionesHoy = reservasPorFecha.get(dateStr) || [];
            
            let bgClass = 'bg-azul text-white'; // Por defecto todos azules
            let dotContent = '•';
            let iconClass = '';
            
            if (assumedMisionesHoy.length > 0) {
              const uniqueCategories = new Set(assumedMisionesHoy.map(m => m.categoria));
              
              if (uniqueCategories.size > 1) {
                bgClass = 'bg-morado text-white';
                dotContent = '🔥';
                iconClass = 'text-xl';
              } else {
                bgClass = `${misionColors[assumedMisionesHoy[0].categoria].bg} text-white`;
                dotContent = assumedMisionesHoy.length > 1 ? `+${assumedMisionesHoy.length}` : '✓';
                iconClass = assumedMisionesHoy.length > 1 ? '' : 'text-sm';
              }
            } else if ((misionesPorFecha.get(dateStr) || []).length === 0) {
              // Si no hay misiones disponibles ni asumidas, se puede poner un poco más opaco o dejar igual
              bgClass = 'bg-azul/50 text-white';
            }

            if (isSelected) {
              bgClass += ' ring-4 ring-offset-2 ring-gray-300';
            }

            return (
              <button
                key={i}
                onClick={() => handleDayClick(date, dateStr)}
                className={`snap-center min-w-[4rem] h-[4.5rem] rounded-2xl flex flex-col items-center justify-center transition-all ${bgClass} shadow-md`}
              >
                <span className="text-xs font-bold">{diasSemana[date.getDay()]}</span>
                <span className={`font-bold leading-none mt-1 ${iconClass || 'text-lg'}`}>{dotContent}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Misiones List (Available only) */}
      <div className="px-5">
        <h2 className="font-heading font-bold text-lg mb-4">Misiones Disponibles</h2>
        
        {misionesHoy.filter(m => !misReservas.some(r => r.mision_id === m.id)).length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500 font-medium">No hay misiones disponibles para ti en este día.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {misionesHoy.filter(m => !misReservas.some(r => r.mision_id === m.id)).map((mision) => {
              const colors = misionColors[mision.categoria];
              
              return (
                <div key={mision.id} className="bg-white rounded-2xl p-5 border-2 border-transparent shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                      {mision.categoria}
                    </span>
                  </div>
                  
                  <h3 className="font-heading font-bold text-[17px] mb-1 leading-tight">{mision.titulo}</h3>
                  <p className="text-sm text-gray-500 mb-3">{mision.descripcion}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {mision.hora}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {mision.cupos_disponibles} cupos
                    </span>
                  </div>

                  <button 
                    onClick={() => handleOpenAssume(mision)}
                    disabled={mision.cupos_disponibles === 0}
                    className={`w-full text-white font-bold py-3 rounded-xl transition-transform active:scale-95 ${mision.cupos_disponibles === 0 ? 'bg-gray-300' : colors.bg}`}
                  >
                    {mision.cupos_disponibles === 0 ? 'Agotado' : 'Asumir Misión'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Misiones Asumidas del Día */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-fondo w-full h-[85vh] sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col">
            <div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <div>
                <h3 className="font-heading font-bold text-xl text-gray-900">Tus Misiones</h3>
                <p className="text-sm text-gray-500 capitalize">{selectedDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {(reservasPorFecha.get(getLocalDateString(selectedDate)) || []).map((mision) => {
                const colors = misionColors[mision.categoria];
                
                return (
                  <div key={mision.id} className={`bg-white rounded-2xl p-5 border-2 border-${colors.text.split('-')[1]} shadow-sm relative overflow-hidden`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                        {mision.categoria}
                      </span>
                    </div>
                    
                    <h3 className="font-heading font-bold text-[17px] mb-1 leading-tight">{mision.titulo}</h3>
                    <p className="text-sm text-gray-500 mb-3">{mision.descripcion}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {mision.hora}
                      </span>
                    </div>

                    <button disabled className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-xl flex justify-center items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Misión Asumida
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Formulario de Confirmación */}
      {misionToAssume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-heading font-bold text-lg">Confirmar Datos</h3>
              <button onClick={() => setMisionToAssume(null)} className="p-1 text-gray-400 hover:text-gray-800"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleConfirmAssume} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input required type="text" value={formData.nombres} onChange={e => setFormData({...formData, nombres: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-azul" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input required type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-azul" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <input required type="number" value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-azul" />
              </div>
              
              <button type="submit" className={`w-full text-white font-bold py-3.5 rounded-xl transition-all ${misionColors[misionToAssume.categoria].bg}`}>
                Confirmar y Asumir
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-slide-up relative">
            <button onClick={() => setShowSuccess(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X className="w-6 h-6"/></button>
            
            <div className="w-16 h-16 bg-verde-light rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-verde" />
            </div>
            
            <h3 className="font-heading font-bold text-2xl mb-2">¡Misión reservada!</h3>
            <p className="text-gray-600 mb-6">
              Has reservado exitosamente la misión <br/>
              <strong className="text-gray-900">"{showSuccess.titulo}"</strong> para el <br/>
              día seleccionado a las {showSuccess.hora}.
            </p>
            
            <div className="bg-azul-light p-4 rounded-2xl mb-6 text-sm text-azul-dark text-left">
              Las pautas y detalles de la misión se enviaron a tu WhatsApp. Por favor, revisa tus mensajes para más información.
            </div>
            
            <button 
              onClick={() => setShowSuccess(null)} 
              className="w-full bg-azul text-white font-bold py-3.5 rounded-xl transition-colors hover:bg-azul-dark"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
