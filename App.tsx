
import React, { useState, useEffect } from 'react';
import { Deal } from './types';
import { db } from './firebase';
import { jsPDF } from 'jspdf';
import { 
  ref, 
  onValue 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

type Language = 'hu' | 'en' | 'de';

const translations = {
  hu: {
    subtitle: "Privát Lista",
    install: "Telepítés",
    export: "PDF Export",
    error_title: "Hálózati Hiba",
    error_msg: "Az adatok jelenleg nem érhetőek el.",
    view_deal: "Megnézem az akciót",
    empty_list: "A lista jelenleg frissítés alatt áll",
    footer: "Biztonságos kapcsolat • Publikus hozzáférés • Verzió 2.0",
    expiry_last_day: "Utolsó nap!",
    expiry_tomorrow: "Holnap lejár",
    expiry_days: (days: number) => `${days} nap van hátra`,
    pdf_title: "Cashback Hub - Aktuális Ajánlatok",
    pdf_created: "Készült",
    pdf_expiry: "Lejárat",
    syncing: "Szinkronizálás...",
    share_msg: "Nézd meg ezt az ajánlatot a Cashback Hub-on!",
    clipboard_msg: "Link a vágólapra másolva!"
  },
  en: {
    subtitle: "Private List",
    install: "Install",
    export: "PDF Export",
    error_title: "Network Error",
    error_msg: "Data is currently unavailable.",
    view_deal: "View Deal",
    empty_list: "The list is currently being updated",
    footer: "Secure connection • Public access • Version 2.0",
    expiry_last_day: "Last day!",
    expiry_tomorrow: "Expires tomorrow",
    expiry_days: (days: number) => `${days} days left`,
    pdf_title: "Cashback Hub - Current Deals",
    pdf_created: "Created",
    pdf_expiry: "Expiry",
    syncing: "Syncing...",
    share_msg: "Check out this deal on Cashback Hub!",
    clipboard_msg: "Link copied to clipboard!"
  },
  de: {
    subtitle: "Private Liste",
    install: "Installieren",
    export: "PDF Export",
    error_title: "Netzwerkfehler",
    error_msg: "Daten sind derzeit nicht verfügbar.",
    view_deal: "Angebot ansehen",
    empty_list: "Die Liste wird derzeit aktualisiert",
    footer: "Sichere Verbindung • Öffentlicher Zugang • Version 2.0",
    expiry_last_day: "Letzter Tag!",
    expiry_tomorrow: "Läuft morgen ab",
    expiry_days: (days: number) => `Noch ${days} Tage`,
    pdf_title: "Cashback Hub - Aktuelle Angebote",
    pdf_created: "Erstellt",
    pdf_expiry: "Ablauf",
    syncing: "Synchronisierung...",
    share_msg: "Schau dir dieses Angebot auf Cashback Hub an!",
    clipboard_msg: "Link in die Zwischenablage kopiert!"
  }
};

const GermanyFlag = () => (
  <div className="flex flex-col w-6 h-4 overflow-hidden rounded-sm shadow-sm border border-white/10">
    <div className="h-1/3 bg-black"></div>
    <div className="h-1/3 bg-[#FF0000]"></div>
    <div className="h-1/3 bg-[#FFCC00]"></div>
  </div>
);

const GermanyRibbon = () => (
  <div className="fixed top-0 right-0 z-[100] pointer-events-none overflow-hidden w-40 h-40">
    <div className="absolute top-0 right-0 w-[170%] h-12 transform rotate-45 translate-x-[30%] translate-y-[40%] shadow-2xl flex flex-col">
      <div className="h-1/3 bg-black"></div>
      <div className="h-1/3 bg-[#FF0000]"></div>
      <div className="h-1/3 bg-[#FFCC00]"></div>
    </div>
  </div>
);

const NorbAppLogo = () => (
  <a 
    href="https://norbertderhorvath.github.io" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="flex items-center gap-2 group cursor-pointer"
  >
    <svg id="norbapp-logo-svg" width="40" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
      <defs>
        <linearGradient id="phone_grad" x1="160" y1="120" x2="380" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE"/>
          <stop offset="1" stopColor="#0891B2"/>
        </linearGradient>
        <linearGradient id="wave_grad" x1="100" y1="300" x2="400" y2="450" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0891B2" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      {/* Wave/Swoosh */}
      <path d="M100 350C150 450 400 450 450 350C400 300 150 300 100 350Z" fill="url(#wave_grad)" />
      {/* Phone Body */}
      <rect x="180" y="100" width="152" height="312" rx="24" fill="#0F172A" stroke="#1E293B" strokeWidth="4" />
      {/* Screen */}
      <rect x="192" y="112" width="128" height="288" rx="16" fill="url(#phone_grad)" />
      {/* Home Button/Indicator */}
      <circle cx="256" cy="375" r="10" fill="white" opacity="0.5" />
      {/* Speaker/Notch */}
      <rect x="230" y="125" width="52" height="6" rx="3" fill="#0F172A" />
      {/* Sparkles */}
      <path d="M140 150L145 140L150 150L160 155L150 160L145 170L140 160L130 155Z" fill="#22D3EE" />
      <path d="M110 180L113 174L116 180L122 183L116 186L113 192L110 186L104 183Z" fill="#22D3EE" opacity="0.6" />
    </svg>
    <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase">NorbApp</span>
  </a>
);

const Logo = ({ id = "main-logo-svg" }: { id?: string }) => (
  <svg id={id} width="40" height="40" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
    <defs>
      <linearGradient id="bg_grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06B6D4"/>
        <stop offset="1" stopColor="#0891B2"/>
      </linearGradient>
      <linearGradient id="bag_grad" x1="256" y1="100" x2="256" y2="400" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF"/>
        <stop offset="1" stopColor="#E2E8F0"/>
      </linearGradient>
      <linearGradient id="coin_grad" x1="150" y1="350" x2="250" y2="450" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047"/>
        <stop offset="1" stopColor="#EAB308"/>
      </linearGradient>
    </defs>
    
    {/* Background Circle */}
    <circle cx="256" cy="256" r="240" fill="url(#bg_grad)" />
    
    {/* Money Bag */}
    <path d="M256 120C200 120 160 160 160 220C160 280 180 380 256 380C332 380 352 280 352 220C352 160 312 120 256 120Z" fill="url(#bag_grad)" />
    <path d="M256 120C280 120 300 100 300 80C300 60 280 40 256 40C232 40 212 60 212 80C212 100 232 120 256 120Z" fill="#F1F5F9" />
    <rect x="212" y="110" width="88" height="12" rx="6" fill="#0891B2" />
    
    {/* Euro Symbol on Bag */}
    <text x="256" y="270" fontFamily="Arial" fontSize="100" fontWeight="bold" fill="#0891B2" textAnchor="middle">€</text>
    
    {/* Gold Coin */}
    <circle cx="180" cy="380" r="70" fill="url(#coin_grad)" stroke="#CA8A04" strokeWidth="4" />
    <text x="180" y="405" fontFamily="Arial" fontSize="70" fontWeight="bold" fill="#854D0E" textAnchor="middle">%</text>
    
    {/* Shopping Cart Bubble */}
    <path d="M380 100C430 100 470 140 470 190C470 240 430 280 380 280C370 280 360 278 350 275L320 300L330 265C310 245 300 220 300 190C300 140 340 100 380 100Z" fill="#22D3EE" stroke="white" strokeWidth="4" />
    <path d="M350 160H370L375 180H410L415 160M375 180L380 210H405L410 180M385 225C385 230 381 234 376 234C371 234 367 230 367 225M410 225C410 230 406 234 401 234C396 234 392 230 392 225" stroke="white" strokeWidth="4" fill="none" />
    
    {/* Sparkles */}
    <path d="M100 150L110 130L120 150L140 160L120 170L110 190L100 170L80 160Z" fill="white" opacity="0.8" />
    <path d="M400 350L405 340L410 350L420 355L410 360L405 370L400 360L390 355Z" fill="white" opacity="0.6" />
  </svg>
);

const App: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [lang, setLang] = useState<Language>('hu');

  const t = translations[lang];

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
        setError(t.error_msg);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [lang]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleShare = async (deal: Deal) => {
    const shareData = {
      title: deal.title,
      text: t.share_msg,
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
      alert(t.clipboard_msg);
    }
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString(lang === 'hu' ? 'hu-HU' : lang === 'de' ? 'de-DE' : 'en-US');
    
    // Helper to convert SVG to Image Data URL
    const svgToDataUrl = async (svgId: string): Promise<string> => {
      const svg = document.getElementById(svgId) as unknown as SVGSVGElement;
      if (!svg) return '';
      
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const data = (new XMLSerializer()).serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          canvas.width = 512;
          canvas.height = 512;
          ctx?.drawImage(img, 0, 0, 512, 512);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = url;
      });
    };

    const mainLogoImg = await svgToDataUrl('main-logo-svg');
    const norbAppLogoImg = await svgToDataUrl('norbapp-logo-svg');

    const drawWatermark = (d: jsPDF) => {
      if (mainLogoImg) {
        d.setGState(new (d as any).GState({ opacity: 0.05 }));
        d.addImage(mainLogoImg, 'PNG', 55, 100, 100, 100);
        d.setGState(new (d as any).GState({ opacity: 1 }));
      }
    };

    const drawFooter = (d: jsPDF, pageNum: number, totalPages: number) => {
      d.setPage(pageNum);
      d.setDrawColor(200, 200, 200);
      d.line(20, 270, 190, 270);
      
      if (norbAppLogoImg) {
        d.addImage(norbAppLogoImg, 'PNG', 20, 272, 8, 8);
      }
      
      d.setFontSize(10);
      d.setTextColor(8, 145, 178);
      d.text('NorbApp', 30, 278);
      
      d.setFontSize(8);
      d.setTextColor(150, 150, 150);
      d.text('Web: norbertderhorvath.github.io', 30, 283);
      
      d.text(`${pageNum} / ${totalPages}`, 180, 278);
    };

    drawWatermark(doc);

    doc.setFontSize(22);
    doc.setTextColor(8, 51, 68); // #083344
    doc.text(t.pdf_title, 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${t.pdf_created}: ${today}`, 20, 30);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(34, 211, 238); // #22D3EE
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    deals.forEach((deal, index) => {
      const yPos = 45 + (index * 12);
      if (yPos > 255) {
        doc.addPage();
        drawWatermark(doc);
        doc.text(`${index + 1}. ${deal.title}`, 20, 20);
        if (deal.expiryDate) {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`${t.pdf_expiry}: ${deal.expiryDate}`, 25, 25);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
        }
      } else {
        doc.text(`${index + 1}. ${deal.title}`, 20, yPos);
        if (deal.expiryDate) {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`${t.pdf_expiry}: ${deal.expiryDate}`, 25, yPos + 5);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
        }
      }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      drawFooter(doc, i, pageCount);
    }
    
    doc.save(`cashback-hub-${lang}-${new Date().toISOString().split('T')[0]}.pdf`);
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
        <p className="text-cyan-500/50 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">{t.syncing}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#083344] text-slate-100 selection:bg-cyan-500 pb-10">
      <GermanyRibbon />
      <header className="sticky top-0 z-50 bg-[#083344]/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <NorbAppLogo />
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-4">
              <Logo />
              <div className="hidden xs:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white leading-none uppercase">Cashback Hub</h1>
                </div>
                <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-70">{t.subtitle}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              {(['hu', 'en', 'de'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    lang === l 
                      ? 'bg-cyan-500 text-cyan-950 shadow-lg' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportPDF}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-xl transition-all border border-cyan-500/20 active:scale-95 flex items-center gap-2 group"
              >
                <svg className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{t.export}</span>
              </button>

              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/10 active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white hidden sm:inline">{t.install}</span>
                </button>
              )}
              
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {error ? (
          <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl text-center">
            <p className="text-rose-400 font-bold text-sm mb-2 uppercase tracking-widest">{t.error_title}</p>
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
                        {days === 0 ? t.expiry_last_day : days === 1 ? t.expiry_tomorrow : t.expiry_days(days)}
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
                      {t.view_deal}
                    </a>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-32 text-center opacity-20">
                <p className="text-cyan-500 font-bold uppercase tracking-[0.5em] text-xs">{t.empty_list}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center">
        <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-cyan-500/40">
          {t.footer}
        </p>
      </footer>
    </div>
  );
};

export default App;
