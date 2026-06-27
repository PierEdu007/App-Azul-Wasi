import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { registrarDonacion, getDonacionesPorMes, getTotalDonaciones } from '@/services/donacionesService';

export default function DonacionesPage() {
  const [form, setForm] = useState({
    nombre_donante: '',
    monto: '',
    metodo: 'Yape' as 'Yape' | 'Plin' | 'Transferencia',
    mensaje: '',
  });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [datosMensuales, setDatosMensuales] = useState<Map<string, number>>(new Map());
  const [totalDonaciones, setTotalDonaciones] = useState(0);

  useEffect(() => {
    getDonacionesPorMes().then(setDatosMensuales).catch(() => {});
    getTotalDonaciones().then(setTotalDonaciones).catch(() => {});
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.monto || Number(form.monto) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    setLoading(true);
    try {
      await registrarDonacion(
        {
          nombre_donante: form.nombre_donante || 'Anónimo',
          monto: Number(form.monto),
          metodo: form.metodo,
          mensaje: form.mensaje,
        },
        archivo || undefined
      );
      toast.success('¡Donación registrada! Gracias por tu generosidad.');
      setSuccess(true);
      setForm({ nombre_donante: '', monto: '', metodo: 'Yape', mensaje: '' });
      setArchivo(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      toast.error('Error al registrar la donación');
    } finally {
      setLoading(false);
    }
  };

  const maxMonto = Math.max(...Array.from(datosMensuales.values()), 1);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return (
    <div className="min-h-screen bg-fondo">
      {/* Header */}
      <div className="bg-gradient-to-r from-verde to-verde-dark text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3 animate-fade-in">Donaciones</h1>
          <p className="text-white/80 text-lg max-w-2xl animate-fade-in">Tu aporte, por pequeño que sea, transforma vidas. Realiza una microdonación directa vía Yape, Plin o transferencia.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* QR Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Yape */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gris-borde text-center hover:shadow-md transition-all duration-300 animate-slide-up">
            <div className="w-16 h-16 bg-[#6C2DC7]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-azul mb-2">Yape</h3>
            <div className="bg-gray-100 rounded-xl p-6 mb-4 aspect-square flex items-center justify-center max-w-[200px] mx-auto">
              <div className="text-center text-gris-texto">
                <svg className="w-16 h-16 mx-auto mb-2 text-gris-borde" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                <p className="text-xs">QR Yape pendiente</p>
              </div>
            </div>
            <p className="text-sm text-gris-texto">Escanea el código QR con tu app de Yape</p>
          </div>

          {/* Plin */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gris-borde text-center hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-[#00BFA5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💳</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-azul mb-2">Plin</h3>
            <div className="bg-gray-100 rounded-xl p-6 mb-4 aspect-square flex items-center justify-center max-w-[200px] mx-auto">
              <div className="text-center text-gris-texto">
                <svg className="w-16 h-16 mx-auto mb-2 text-gris-borde" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                <p className="text-xs">QR Plin pendiente</p>
              </div>
            </div>
            <p className="text-sm text-gris-texto">Escanea el código QR con tu app de Plin</p>
          </div>

          {/* Bank Transfer */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gris-borde text-center hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-azul/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏦</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-azul mb-2">Transferencia</h3>
            <div className="bg-azul-light rounded-xl p-5 mb-4 text-left">
              <p className="text-xs text-gris-texto mb-1">Cuenta Interbancaria (CCI)</p>
              <p className="font-mono text-sm font-semibold text-azul break-all">XXX-XXX-XXXXXXXXXX-XX</p>
              <hr className="my-3 border-azul/10" />
              <p className="text-xs text-gris-texto mb-1">Titular</p>
              <p className="text-sm font-semibold text-azul">Albergue Azul Wasi</p>
            </div>
            <p className="text-sm text-gris-texto">Copia el CCI y transfiere desde tu banco</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div className="animate-slide-up">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gris-borde">
              <h2 className="font-heading text-xl font-bold text-azul mb-2">Registra tu Aporte</h2>
              <p className="text-gris-texto text-sm mb-6">Opcional. Registrar tu donación nos ayuda a mantener la transparencia.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre (opcional)</label>
                  <input
                    type="text"
                    value={form.nombre_donante}
                    onChange={(e) => setForm({ ...form, nombre_donante: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-verde focus:ring-2 focus:ring-verde/10 outline-none transition-all text-sm"
                    placeholder="Tu nombre o déjalo en blanco para ser anónimo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto (S/) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.50"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-verde focus:ring-2 focus:ring-verde/10 outline-none transition-all text-sm"
                    placeholder="10.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Yape', 'Plin', 'Transferencia'] as const).map((metodo) => (
                      <button
                        key={metodo}
                        type="button"
                        onClick={() => setForm({ ...form, metodo })}
                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                          form.metodo === metodo
                            ? 'bg-verde text-white border-verde shadow-sm'
                            : 'bg-white text-gris-texto border-gris-borde hover:border-verde/50'
                        }`}
                      >
                        {metodo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Captura del boucher (opcional)</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                      archivo ? 'border-verde bg-verde-light' : 'border-gris-borde hover:border-verde/50'
                    }`}
                    onClick={() => document.getElementById('boucher-input')?.click()}
                  >
                    <input
                      id="boucher-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                    />
                    {archivo ? (
                      <div className="flex items-center justify-center gap-2 text-verde-dark">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-sm font-medium">{archivo.name}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mx-auto mb-2 text-gris-borde" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm text-gris-texto">Click para subir imagen del boucher</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje (opcional)</label>
                  <textarea
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gris-borde focus:border-verde focus:ring-2 focus:ring-verde/10 outline-none transition-all text-sm resize-none"
                    rows={2}
                    placeholder="Un mensaje de apoyo para los niños..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-verde hover:bg-verde-dark disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-verde/25 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Registrando...</>
                  ) : (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> Registrar mi aporte</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Transparency Chart */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gris-borde">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-azul">Transparencia</h2>
                  <p className="text-gris-texto text-sm">Donaciones por mes</p>
                </div>
                <div className="bg-verde-light text-verde-dark px-4 py-2 rounded-xl">
                  <p className="text-xs font-medium">Total recaudado</p>
                  <p className="text-lg font-bold">S/ {totalDonaciones.toLocaleString()}</p>
                </div>
              </div>

              {datosMensuales.size > 0 ? (
                <div className="space-y-3">
                  {Array.from(datosMensuales.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(-6)
                    .map(([mesKey, monto]) => {
                      const [, mesNum] = mesKey.split('-');
                      const mesNombre = meses[parseInt(mesNum) - 1] || mesKey;
                      const porcentaje = (monto / maxMonto) * 100;
                      return (
                        <div key={mesKey}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gris-texto font-medium">{mesNombre}</span>
                            <span className="font-semibold text-azul">S/ {monto.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-verde to-verde-dark h-3 rounded-full transition-all duration-1000"
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gris-borde" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  <p className="text-gris-texto">Las donaciones registradas aparecerán aquí</p>
                  <p className="text-gris-texto text-sm mt-1">Sé el primero en aportar ✨</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
