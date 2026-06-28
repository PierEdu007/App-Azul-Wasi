import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, User, Phone, Calendar } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [password, setPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [celular, setCelular] = useState('');
  const [edad, setEdad] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Creamos un correo falso basado en el celular para satisfacer a Supabase
    const fakeEmail = `${celular}@azulwasi.com`;
    
    try {
      if (isLogin) {
        await login(fakeEmail, password);
        toast.success('¡Bienvenido de vuelta!');
      } else {
        await register(fakeEmail, password, nombres, celular, parseInt(edad));
        toast.success('¡Cuenta creada con éxito!');
      }
      navigate('/misiones');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-azul flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <img src="/images/img_1800.webp" alt="Fondo" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up relative z-10">
        {/* Header */}
        <div className="bg-azul p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="font-bold text-2xl">AW</span>
          </div>
          <h1 className="text-2xl font-bold font-heading mb-1">Azul Connect</h1>
          <p className="text-white/80 text-sm">Conectando corazones, transformando vidas</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${isLogin ? 'text-azul border-b-2 border-azul' : 'text-gray-400'}`}
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${!isLogin ? 'text-azul border-b-2 border-azul' : 'text-gray-400'}`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombres Completos</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azul/20 focus:border-azul outline-none transition-all"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azul/20 focus:border-azul outline-none transition-all"
                      placeholder="25"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azul/20 focus:border-azul outline-none transition-all"
                  placeholder="987654321"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-azul/20 focus:border-azul outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-azul text-white font-bold py-3.5 rounded-xl hover:bg-azul-dark transition-colors flex justify-center items-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? 'Ingresar' : 'Unirse como Voluntario'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
