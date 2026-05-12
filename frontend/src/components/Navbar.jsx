import { Wand2, Menu, X, History } from 'lucide-react';

export default function Navbar({ onHistoryClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Examples', href: '#examples' },
  ];

  return (
    <nav
      className={`fixed z-50 transition-all duration-500 ease-out left-1/2 -translate-x-1/2 ${
        scrolled 
          ? 'top-4 w-[calc(100%-2rem)] max-w-5xl py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl' 
          : 'top-0 w-full max-w-none py-6 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-none'
      }`}
    >
      <div className="px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white btn-modern shadow-none">
            <Wand2 size={20} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">
            Pixel<span className="text-blue-600">Pure</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
          
          <button 
            onClick={onHistoryClick}
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all"
          >
            <History size={16} /> History
          </button>
        </div>

        {/* Desktop CTA */}
        <a
          href="#tool"
          className="hidden md:flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white btn-modern"
        >
          Try Free
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '300px' : '0', opacity: open ? 1 : 0 }}
      >
        <div className="flex flex-col gap-2 p-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#tool"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 mt-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white btn-modern"
          >
            Try Free
          </a>
        </div>
      </div>
    </nav>
  );
}
