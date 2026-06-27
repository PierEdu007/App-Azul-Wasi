import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Don't show layout on admin pages
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return <Outlet />;

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/agendar', label: 'Agendar Visita' },
    { to: '/donaciones', label: 'Donaciones' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gris-borde sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-azul rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">AW</span>
              </div>
              <span className="font-heading font-bold text-azul text-lg">Azul Wasi</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-azul text-white'
                      : 'text-gris-texto hover:text-azul hover:bg-azul-light'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? (
                <svg className="w-6 h-6 text-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6 text-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gris-borde animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-azul text-white'
                      : 'text-gris-texto hover:text-azul hover:bg-azul-light'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-azul-dark text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AW</span>
                </div>
                <span className="font-heading font-bold text-lg">Azul Wasi</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">Un hogar lleno de esperanza para niños en situación de vulnerabilidad.</p>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-3 text-sm">Navegación</h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} className="block text-white/60 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-3 text-sm">Contacto</h4>
              <p className="text-white/60 text-sm">Dirigido por Don Alcides</p>
              <p className="text-white/60 text-sm mt-1">Albergue Infantil Azul Wasi</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center">
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} Azul Wasi. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
