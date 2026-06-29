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
    <div className="bg-gray-100 min-h-screen flex justify-center">
      {/* Mobile container - restricts width on Desktop */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Global Logout Button */}
        <button 
          onClick={handleLogout}
          className="absolute top-6 right-5 z-[100] p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all shadow-sm border border-white/20 active:scale-95"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" strokeWidth={2.5} />
        </button>


        {/* Main Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto pb-24 bg-fondo">
          <Outlet />
        </main>

        {/* Fixed Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe">
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
