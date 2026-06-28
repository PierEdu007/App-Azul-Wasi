import { Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonarPage() {

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Número copiado al portapapeles');
  };

  return (
    <div className="min-h-[100dvh] bg-azul flex flex-col pb-20">
      {/* Header */}
      <div className="pt-6 pb-8 px-6 text-white">
        <h2 className="font-heading font-bold text-3xl mb-1">Apoyo Directo</h2>
        <p className="text-white/90">Tu granito de arena cambia vidas</p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-t-3xl flex-1 px-5 pt-8 pb-8 flex flex-col items-center">
        
        <h3 className="font-heading font-bold text-xl mb-2 text-center text-gray-900">Haz una micro-donación</h3>
        <p className="text-gray-500 text-center text-sm mb-6 px-4">
          Desde 1 sol puedes ayudar a construir un mejor futuro para los niños del hogar
        </p>

        <div className="w-full space-y-6">
          {/* Yape Card */}
          <div className="w-full bg-[#faf5ff] border border-purple-100 rounded-3xl p-6 relative shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-xl text-purple-900">Yape</span>
              <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">Transferencia instantánea</span>
            </div>

            <div className="bg-purple-100 rounded-2xl aspect-square w-48 mx-auto mb-6 flex items-center justify-center">
              {/* Fake QR or Icon placeholder for Yape */}
              <div className="w-16 h-16 bg-purple-600 rounded-xl grid grid-cols-3 gap-1 p-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={`rounded-sm ${i === 4 ? 'bg-yellow-400' : i === 7 ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-4">
              <p className="text-gray-500 text-xs font-medium mb-1">Número de Yape</p>
              <p className="font-bold text-lg text-gray-900">987654321</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => copyToClipboard('987654321')}
                className="flex-1 bg-purple-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
              >
                <Copy className="w-5 h-5" /> Copiar número
              </button>
              <button className="bg-purple-100 text-purple-600 p-3.5 rounded-xl hover:bg-purple-200 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Plin Card */}
          <div className="w-full bg-[#f0fdfa] border border-cyan-100 rounded-3xl p-6 relative shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-xl text-cyan-900">Plin</span>
              <span className="bg-[#009fb2] text-white text-[10px] font-bold px-3 py-1.5 rounded-full">Transferencia instantánea</span>
            </div>

            <div className="bg-cyan-100 rounded-2xl aspect-square w-48 mx-auto mb-6 flex items-center justify-center">
              {/* Fake QR or Icon placeholder for Plin */}
              <div className="w-16 h-10 bg-blue-500 rounded-md relative overflow-hidden">
                 <div className="absolute top-2 left-0 w-full h-2 bg-white/20"></div>
                 <div className="absolute bottom-2 right-2 w-2 h-2 bg-yellow-400 rounded-sm"></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-4">
              <p className="text-gray-500 text-xs font-medium mb-1">Número de Plin</p>
              <p className="font-bold text-lg text-gray-900">987654321</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => copyToClipboard('987654321')}
                className="flex-1 bg-[#009fb2] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#008293] transition-colors"
              >
                <Copy className="w-5 h-5" /> Copiar número
              </button>
              <button className="bg-cyan-100 text-[#009fb2] p-3.5 rounded-xl hover:bg-cyan-200 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Transparency Banner */}
        <div className="mt-8 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl w-full text-center">
          <p className="text-sm text-blue-900">
            <strong className="text-blue-700">100% transparente:</strong> Cada donación va directamente a las necesidades del hogar
          </p>
        </div>

      </div>
    </div>
  );
}
