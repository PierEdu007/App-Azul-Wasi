import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getTotalDonaciones } from '@/services/donacionesService';

export default function HomePage() {
  const [totalDonaciones, setTotalDonaciones] = useState(0);

  useEffect(() => {
    getTotalDonaciones().then(setTotalDonaciones).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-azul via-azul-dark to-[#002244] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-verde rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-azul-light rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 text-sm font-medium">
              <span className="w-2 h-2 bg-verde rounded-full animate-pulse"></span>
              Albergue activo — Recibiendo voluntarios
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Cambiamos vidas,
              <span className="block text-verde mt-2">una visita a la vez</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Azul Wasi es un hogar para niños que necesitan amor y apoyo. Agenda tu visita como voluntario o realiza una donación para transformar sus vidas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/agendar"
                className="inline-flex items-center justify-center gap-2 bg-verde hover:bg-verde-dark text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 hover:shadow-lg hover:shadow-verde/25 hover:-translate-y-0.5 animate-pulse-soft"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Agenda tu visita
              </Link>
              <Link
                to="/donaciones"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300 border border-white/20 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                Haz una donación
              </Link>
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L48 36.7C96 33.3 192 26.7 288 30C384 33.3 480 46.7 576 50C672 53.3 768 46.7 864 40C960 33.3 1056 26.7 1152 30C1248 33.3 1344 46.7 1392 53.3L1440 60V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V40Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '🏠', label: 'Hogar seguro', desc: 'Para niños en situación vulnerable' },
            { icon: '🤝', label: 'Voluntariado activo', desc: 'Agenda directa sin burocracia' },
            { icon: '💚', label: totalDonaciones > 0 ? `S/ ${totalDonaciones.toLocaleString()}` : 'Transparencia total', desc: totalDonaciones > 0 ? 'Recaudado en donaciones' : 'Cada sol es visible' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gris-borde hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="font-heading text-lg font-bold text-azul mb-1">{item.label}</h3>
              <p className="text-gris-texto text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <span className="inline-block text-verde font-semibold text-sm tracking-wider uppercase mb-4">Nuestra misión</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-azul mb-6 leading-tight">
              Un hogar lleno de esperanza para quienes más lo necesitan
            </h2>
            <p className="text-gris-texto leading-relaxed mb-6">
              Azul Wasi brinda refugio, educación y amor a niños en situación de vulnerabilidad. Bajo la dirección de Don Alcides, el albergue funciona como un verdadero hogar donde cada niño tiene la oportunidad de crecer con dignidad.
            </p>
            <p className="text-gris-texto leading-relaxed mb-8">
              Nuestro sistema de agendamiento permite organizar las visitas de forma ordenada, respetando la rutina y tranquilidad de los niños. Cada voluntario es bienvenido en el horario adecuado.
            </p>
            <Link
              to="/agendar"
              className="inline-flex items-center gap-2 text-verde font-semibold hover:text-verde-dark transition-colors"
            >
              Conoce cómo ayudar
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-azul-light to-verde-light rounded-3xl p-8 sm:p-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-azul rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-azul">Agendamiento autónomo</p>
                    <p className="text-xs text-gris-texto">Sin burocracia ni correos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-verde rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-verde-dark">Donaciones transparentes</p>
                    <p className="text-xs text-gris-texto">Cada aporte es visible</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f59e0b] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#b45309]">Espacio seguro</p>
                    <p className="text-xs text-gris-texto">Control de acceso del director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-azul to-azul-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">¿Listo para hacer la diferencia?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Cada visita y cada donación transforman la vida de un niño. Tu aporte, por pequeño que sea, construye un futuro mejor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/agendar"
              className="inline-flex items-center justify-center gap-2 bg-verde hover:bg-verde-dark text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-lg"
            >
              Agendar visita voluntaria
            </Link>
            <Link
              to="/donaciones"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 border border-white/20"
            >
              Donar ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
