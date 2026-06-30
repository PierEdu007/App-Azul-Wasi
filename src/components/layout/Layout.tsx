import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Hide nav on admin pages or login
  const isHidden = location.pathname.startsWith('/admin') || location.pathname === '/login';
  if (isHidden) return <Outlet />;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-gray-100 min-h-[100dvh] flex justify-center w-full">
      {/* Responsive container */}
      <div className="w-full md:max-w-6xl md:flex md:flex-row bg-white min-h-[100dvh] relative shadow-2xl overflow-hidden">
        
        {/* Mobile Logout Button (Hidden on Desktop) */}
        <button 
          onClick={handleLogout}
          className="md:hidden absolute top-6 right-5 z-[100] p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all shadow-sm border border-white/20 active:scale-95"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Desktop Sidebar Navigation */}
        <nav className="hidden md:flex flex-col w-64 border-r border-gray-100 bg-white pt-8 pb-6 h-[100dvh] sticky top-0 z-40">
          <div className="px-8 mb-10">
            <h1 className="font-heading font-bold text-2xl text-azul">Azul Connect</h1>
            <p className="text-gray-400 text-xs mt-1">Hogar Azul Wasi</p>
          </div>
          <div className="flex flex-col gap-2 px-4 flex-1">
            <Link to="/misiones" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/misiones') ? 'bg-azul text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Calendar className="w-5 h-5" /> <span className="font-bold text-sm">Misiones</span>
            </Link>
            <Link to="/aprende" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/aprende') ? 'bg-azul text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <BookOpen className="w-5 h-5" /> <span className="font-bold text-sm">Aprende</span>
            </Link>
            <Link to="/donar" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive('/donar') ? 'bg-azul text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Heart className="w-5 h-5" /> <span className="font-bold text-sm">Donar</span>
            </Link>
          </div>
          <div className="px-6 mt-auto">
             <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors">
               <LogOut className="w-5 h-5"/> Cerrar Sesión
             </button>
          </div>
        </nav>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 h-[100dvh] overflow-y-auto pb-24 md:pb-0 bg-fondo relative">
          <Outlet />
        </main>

        {/* Fixed Bottom Navigation (Mobile Only) */}
        <nav className="md:hidden absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe z-50">
          <Link 
            to="/misiones" 
            className={`flex flex-col items-center gap-1 ${isActive('/misiones') ? 'text-azul' : 'text-gray-400'}`}
          >
            <Calendar className={`w-6 h-6 ${isActive('/misiones') ? 'fill-azul/10' : ''}`} strokeWidth={isActive('/misiones') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Misiones</span>
          </Link>
          
          <Link 
            to="/aprende" 
            className={`flex flex-col items-center gap-1 ${isActive('/aprende') ? 'text-azul' : 'text-gray-400'}`}
          >
            <BookOpen className={`w-6 h-6 ${isActive('/aprende') ? 'fill-azul/10' : ''}`} strokeWidth={isActive('/aprende') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Aprende</span>
          </Link>

          <Link 
            to="/donar" 
            className={`flex flex-col items-center gap-1 ${isActive('/donar') ? 'text-azul' : 'text-gray-400'}`}
          >
            <Heart className={`w-6 h-6 ${isActive('/donar') ? 'fill-azul/10' : ''}`} strokeWidth={isActive('/donar') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Donar</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
