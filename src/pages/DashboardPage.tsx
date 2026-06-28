import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getVisitasSemana,
  getDiasBloqueados,
  bloquearDia,
  desbloquearDia,
  cancelarVisita,
  type Visita,
  type DiaBloqueado,
} from '@/services/visitasService';
import { getDonaciones, type Donacion } from '@/services/donacionesService';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'agenda' | 'bloqueos' | 'donaciones'>('agenda');
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [diasBloqueados, setDiasBloqueados] = useState<DiaBloqueado[]>([]);
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showBloquearModal, setShowBloquearModal] = useState(false);
  const [bloqueoForm, setBloqueoForm] = useState({ fecha: '', motivo: '' });

  const getWeekRange = useCallback((offset: number) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const format = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: format(startOfWeek), end: format(endOfWeek), startDate: startOfWeek, endDate: endOfWeek };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getWeekRange(weekOffset);
      const [visitasData, bloqueadosData, donacionesData] = await Promise.all([
        getVisitasSemana(start, end),
        getDiasBloqueados(),
        getDonaciones(20),
      ]);
      setVisitas(visitasData);
      setDiasBloqueados(bloqueadosData);
      setDonaciones(donacionesData);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [weekOffset, getWeekRange]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Sesión cerrada');
  };

  const handleCancelarVisita = async (id: string) => {
    if (!confirm('¿Cancelar esta visita?')) return;
    try {
      await cancelarVisita(id);
      toast.success('Visita cancelada');
      loadData();
    } catch {
      toast.error('Error al cancelar');
    }
  };

  const handleBloquearDia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bloquearDia(bloqueoForm.fecha, bloqueoForm.motivo);
      toast.success('Día bloqueado exitosamente');
      setShowBloquearModal(false);
      setBloqueoForm({ fecha: '', motivo: '' });
      loadData();
    } catch {
      toast.error('Error al bloquear día');
    }
  };

  const handleDesbloquearDia = async (dia: DiaBloqueado) => {
    if (!confirm(`¿Desbloquear el día ${dia.fecha}?`)) return;
    try {
      await desbloquearDia(dia.id!);
      toast.success('Día desbloqueado');
      loadData();
    } catch {
      toast.error('Error al desbloquear');
    }
  };

  const { startDate, endDate } = getWeekRange(weekOffset);
  const weekLabel = `${startDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} — ${endDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const tabs = [
    { id: 'agenda' as const, label: 'Agenda Semanal', icon: '📋' },
    { id: 'bloqueos' as const, label: 'Bloqueo de Días', icon: '🔒' },
    { id: 'donaciones' as const, label: 'Donaciones', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-fondo">
      {/* Admin Header */}
      <div className="bg-azul-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏠</span>
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold">Panel de Control</h1>
              <p className="text-white/60 text-xs">Azul Wasi — Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gris-borde">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-azul text-azul'
                    : 'border-transparent text-gris-texto hover:text-azul hover:border-azul/30'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-azul/20 border-t-azul rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Agenda Tab */}
            {activeTab === 'agenda' && (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-heading text-xl font-bold text-azul">Visitas de la semana</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 hover:bg-azul-light rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-sm font-medium text-gris-texto min-w-[200px] text-center">{weekLabel}</span>
                    <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 hover:bg-azul-light rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                {visitas.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gris-borde overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gris-borde">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider">Fecha</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider">Voluntario</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider hidden md:table-cell">Horario</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider hidden lg:table-cell">Actividad</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider">Estado</th>
                            <th className="px-5 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gris-borde">
                          {visitas.map((v) => (
                            <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4 text-sm font-medium text-azul whitespace-nowrap">{new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                              <td className="px-5 py-4 text-sm text-gray-700">{v.nombre_voluntario}</td>
                              <td className="px-5 py-4 text-sm text-gris-texto hidden sm:table-cell">{v.telefono}</td>
                              <td className="px-5 py-4 text-sm text-gris-texto hidden md:table-cell">{v.bloque_horario}</td>
                              <td className="px-5 py-4 text-sm text-gris-texto hidden lg:table-cell max-w-[200px] truncate">{v.actividad_a_realizar}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  v.estado === 'Confirmado'
                                    ? 'bg-verde-light text-verde-dark'
                                    : 'bg-rojo-light text-rojo'
                                }`}>{v.estado}</span>
                              </td>
                              <td className="px-5 py-4">
                                {v.estado === 'Confirmado' && (
                                  <button
                                    onClick={() => handleCancelarVisita(v.id!)}
                                    className="text-rojo hover:text-rojo/80 text-xs font-medium"
                                  >Cancelar</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gris-borde">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-gris-texto font-medium">No hay visitas programadas esta semana</p>
                  </div>
                )}
              </div>
            )}

            {/* Bloqueos Tab */}
            {activeTab === 'bloqueos' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-bold text-azul">Días Bloqueados</h2>
                  <button
                    onClick={() => setShowBloquearModal(true)}
                    className="bg-rojo hover:bg-rojo/90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Bloquear día
                  </button>
                </div>

                {diasBloqueados.length > 0 ? (
                  <div className="grid gap-3">
                    {diasBloqueados
                      .sort((a, b) => a.fecha.localeCompare(b.fecha))
                      .map((dia) => (
                        <div key={dia.id} className="bg-white rounded-xl p-5 shadow-sm border border-gris-borde flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rojo-light rounded-xl flex items-center justify-center">
                              <span className="text-rojo text-lg">🔒</span>
                            </div>
                            <div>
                              <p className="font-semibold text-azul">{new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                              <p className="text-sm text-gris-texto">{dia.motivo}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDesbloquearDia(dia)}
                            className="text-verde hover:text-verde-dark text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                            Desbloquear
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gris-borde">
                    <span className="text-4xl mb-4 block">✅</span>
                    <p className="text-gris-texto font-medium">No hay días bloqueados</p>
                    <p className="text-gris-texto text-sm mt-1">Todos los días están disponibles para visitas</p>
                  </div>
                )}

                {/* Bloquear Modal */}
                {showBloquearModal && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md animate-fade-in">
                      <h3 className="font-heading text-lg font-bold text-azul mb-4">Bloquear un día</h3>
                      <form onSubmit={handleBloquearDia} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha a bloquear *</label>
                          <input
                            type="date"
                            required
                            value={bloqueoForm.fecha}
                            onChange={(e) => setBloqueoForm({ ...bloqueoForm, fecha: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-azul focus:ring-2 focus:ring-azul/10 outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo *</label>
                          <input
                            type="text"
                            required
                            value={bloqueoForm.motivo}
                            onChange={(e) => setBloqueoForm({ ...bloqueoForm, motivo: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-azul focus:ring-2 focus:ring-azul/10 outline-none transition-all text-sm"
                            placeholder="Ej: Exámenes de los niños"
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowBloquearModal(false)}
                            className="flex-1 py-3 rounded-xl border border-gris-borde text-gris-texto font-medium text-sm hover:bg-gray-50 transition-all"
                          >Cancelar</button>
                          <button
                            type="submit"
                            className="flex-1 bg-rojo hover:bg-rojo/90 text-white font-semibold py-3 rounded-xl text-sm transition-all"
                          >Bloquear</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Donaciones Tab */}
            {activeTab === 'donaciones' && (
              <div className="animate-fade-in">
                <h2 className="font-heading text-xl font-bold text-azul mb-6">Donaciones Recientes</h2>
                {donaciones.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gris-borde overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gris-borde">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider">Fecha</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider">Donante</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider">Monto</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider hidden sm:table-cell">Método</th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gris-texto uppercase tracking-wider hidden md:table-cell">Boucher</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gris-borde">
                          {donaciones.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4 text-sm text-gris-texto whitespace-nowrap">{d.fecha ? new Date(d.fecha).toLocaleDateString('es-PE') : '-'}</td>
                              <td className="px-5 py-4 text-sm font-medium text-gray-700">{d.nombre_donante}</td>
                              <td className="px-5 py-4 text-sm font-bold text-verde-dark">S/ {d.monto?.toFixed(2)}</td>
                              <td className="px-5 py-4 hidden sm:table-cell">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-azul-light text-azul">{d.metodo}</span>
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                {d.boucher_url ? (
                                  <a href={d.boucher_url} target="_blank" rel="noopener noreferrer" className="text-verde text-xs font-medium hover:underline">Ver imagen</a>
                                ) : <span className="text-gris-texto text-xs">Sin boucher</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gris-borde">
                    <span className="text-4xl mb-4 block">💰</span>
                    <p className="text-gris-texto font-medium">No hay donaciones registradas</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
