
import React, { useState, useEffect } from 'react';
import { Deal } from './types';
import { db } from './firebase';
import { 
  ref, 
  onValue 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M256 64C150 64 64 150 64 256C64 362 150 448 256 448C362 448 448 362 448 256" stroke="#22D3EE" strokeWidth="40" strokeLinecap="round" strokeDasharray="15 25"/>
    <path d="M280 120L160 280H260V400L380 240H280V120Z" fill="url(#logo_grad)"/>
    <defs>
      <linearGradient id="logo_grad" x1="160" y1="120" x2="380" y2="400" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22D3EE"/>
        <stop offset="1" stopColor="#0891B2"/>
      </linearGradient>
    </defs>
  </svg>
);

const App: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const dealsRef = ref(db, 'deals');
    const unsubscribe = onValue(dealsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const todayStr = new Date().toISOString().split('T')[0];
          const dealsList = Object.entries(data).map(([id, val]: [string, any]) => ({
            ...val,
            id
          })) as Deal[];

          const filteredList = dealsList.filter(deal => {
            const isReady = String(deal.isReady) === "true" || String((deal as any).isready) === "true";
            const isNotExpired = !deal.expiryDate || deal.expiryDate >= todayStr;
            return isReady && isNotExpired;
          });

          setDeals(filteredList.sort((a, b) => (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999')));
        } else {
          setDeals([]);
        }
      } catch (err) {
        setError("Az adatok jelenleg nem érhetőek el.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleShare = async (deal: Deal) => {
    const shareData = {
      title: deal.title,
      text: `Nézd meg ezt az ajánlatot a Cashback Hub-on!`,
      url: deal.finalLink || deal.link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      // Fallback: vágólapra másolás
      navigator.clipboard.writeText(shareData.url);
      alert('Link a vágólapra másolva!');
    }
  };

  const getRemainingDays = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate).getTime() - new Date().setHours(0,0,0,0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#083344] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-500/50 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Szinkronizálás...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#083344] text-slate-100 selection:bg-cyan-500 pb-10">
      <header className="sticky top-0 z-50 bg-[#083344]/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="hidden xs:block">
              <h1 className="text-lg font-black tracking-tight text-white leading-none uppercase">Cashback Hub</h1>
              <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-70">Privát Lista</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/10 active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-white hidden sm:inline">Telepítés</span>
              </button>
            )}
            
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {error ? (
          <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl text-center">
            <p className="text-rose-400 font-bold text-sm mb-2 uppercase tracking-widest">Hálózati Hiba</p>
            <p className="text-rose-400/60 text-xs">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.length > 0 ? deals.map(deal => {
              const days = getRemainingDays(deal.expiryDate);
              return (
                <div key={deal.id} className="group bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] overflow-hidden flex flex-col hover:border-cyan-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10">
                  <div className="h-52 bg-slate-800 relative overflow-hidden">
                    {deal.imageUrl ? (
                      <img src={deal.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                        <Logo />
                      </div>
                    )}
                    
                    {days !== null && (
                      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-xl backdrop-blur-md ${days <= 3 ? 'bg-rose-500/90 text-white' : 'bg-cyan-500/90 text-cyan-950'}`}>
                        {days === 0 ? "Utolsó nap!" : days === 1 ? "Holnap lejár" : `${days} nap van hátra`}
                      </div>
                    )}

                    <button 
                      onClick={() => handleShare(deal)}
                      className="absolute top-4 right-4 p-2.5 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-xl text-white transition-all active:scale-90"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    </button>
                  </div>

                  <div className="p-7 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 line-clamp-2 min-h-[3rem] leading-tight group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{deal.title}</h3>
                    <a 
                      href={deal.finalLink || deal.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-auto w-full bg-cyan-500 text-cyan-950 hover:bg-white hover:text-cyan-950 py-4 rounded-2xl font-black text-center text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                    >
                      Megnézem az akciót
                    </a>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-32 text-center opacity-20">
                <p className="text-cyan-500 font-bold uppercase tracking-[0.5em] text-xs">A lista jelenleg frissítés alatt áll</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center">
        <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-cyan-500/40">
          Biztonságos kapcsolat • Publikus hozzáférés • Verzió 2.0
        </p>
      </footer>
    </div>
  );
};

export default App;
