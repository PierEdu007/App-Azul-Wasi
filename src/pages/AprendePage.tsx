import { useState } from 'react';
import { Search, Clock } from 'lucide-react';

const CATEGORIAS = ['Tecnología', 'Matemáticas', 'Idiomas', 'Habilidades'];

const VIDEOS = [
  { id: '1', title: 'Cómo usar Excel desde cero', category: 'Tecnología', duration: '99 min', ytId: 'eZPCVg4Jk00', icon: '📊' },
  { id: '2', title: 'Formatear tu PC paso a paso', category: 'Tecnología', duration: '35 min', ytId: 'H2QU4p8f16U', icon: '💻' },
  { id: '3', title: 'Álgebra básica explicada', category: 'Matemáticas', duration: '83 min', ytId: '_6uyQISZvBc', icon: '🔢' },
  { id: '4', title: 'Inglés conversacional', category: 'Idiomas', duration: '48 min', ytId: 'leqSSYVxa1E', icon: '🗣️' },
  { id: '5', title: 'Cómo hacer un CV perfecto', category: 'Habilidades', duration: '14 min', ytId: 'toYqGCBi1gM', icon: '📄' },
  { id: '6', title: 'PowerPoint profesional', category: 'Tecnología', duration: '11 min', ytId: 'aQlTPUvVH5E', icon: '🎨' },
];

export default function AprendePage() {
  const [activeCategory, setActiveCategory] = useState<string>('Tecnología');
  const [search, setSearch] = useState('');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filteredVideos = VIDEOS.filter(v => 
    v.category === activeCategory && 
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] bg-fondo pb-24 flex flex-col">
      {/* Search Header */}
      <div className="bg-azul px-6 pt-8 pb-12">
        <h2 className="font-heading font-bold text-3xl mb-1 text-white">Repositorio del Saber</h2>
        <p className="text-white/80 text-sm mb-6">Aprende algo nuevo hoy para enseñar mañana</p>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/60" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 w-full p-4 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 outline-none transition-all text-sm text-white placeholder-white/60"
            placeholder="Busca un tutorial (ej. Formatear PC, Álgebra)..."
          />
        </div>
      </div>

      {/* Main Content inside a rounded white card */}
      <div className="bg-white rounded-t-3xl -mt-6 pt-6 flex-1 shadow-sm">
        {/* Categories */}
        <div className="mb-6 px-5">
          <h3 className="font-bold text-gray-900 mb-3">Categorías</h3>
          <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
            {CATEGORIAS.map((cat) => {
              let colorClass = 'bg-gray-50 text-gray-500 border border-gray-200';
              if (activeCategory === cat) {
                colorClass = 'bg-azul text-white shadow-md border border-azul';
              } else {
                if (cat === 'Tecnología') colorClass = 'bg-blue-100 text-blue-600 border border-blue-100';
                if (cat === 'Matemáticas') colorClass = 'bg-purple-100 text-purple-600 border border-purple-100';
                if (cat === 'Idiomas') colorClass = 'bg-green-100 text-green-700 border border-green-100';
                if (cat === 'Habilidades') colorClass = 'bg-orange-100 text-orange-600 border border-orange-100';
              }
              
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${colorClass}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Grid */}
        <div className="px-5">
          {filteredVideos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No se encontraron videos en esta categoría.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredVideos.map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => setPlayingVideo(video.ytId)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col"
                >
                  <div className="w-full aspect-square bg-[#eef2ff] flex items-center justify-center relative">
                    <span className="text-6xl drop-shadow-sm">{video.icon}</span>
                    <div className="absolute bottom-2 right-2 bg-gray-800/70 text-white text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
                      <Clock className="w-3 h-3" /> {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-heading font-bold text-sm leading-tight text-gray-900 mb-1">{video.title}</h4>
                    <p className="text-xs text-gray-500">{video.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <button 
            onClick={() => setPlayingVideo(null)} 
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-[110] bg-gray-800/50 p-3 rounded-full shadow-lg border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="w-full max-w-md bg-black rounded-2xl overflow-hidden relative shadow-2xl">
            <div className="aspect-video w-full bg-gray-900">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
