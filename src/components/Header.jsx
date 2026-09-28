import { Menu, Plus } from "lucide-react";

export default function Header({ title, onMenu, onNewPost }) {
  return (
    <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center gap-3">
      <button onClick={onMenu} aria-label="Open menu" className="lg:hidden p-2 rounded-lg hover:bg-slate-200 transition"><Menu size={20} /></button>
      <h1 className="text-6xl font-semibold !font-display !text-orange-800 flex-1">{title}</h1>
    </header>
  );
}
