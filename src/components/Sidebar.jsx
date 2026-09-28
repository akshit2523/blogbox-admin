import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, MessageSquare, PenLine } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/blogs", label: "Blogs", icon: FileText },
  { to: "/comments", label: "Comments", icon: MessageSquare },
];

export default function Sidebar({ open, onClose, draftCount }) {
  return (
    <>
      {open && (
        <div className="a-fade fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-60 bg-orange-100 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 py-6 flex items-center gap-2 font-semibold text-orange-800 text-lg">
          <PenLine size={20} className="text-orange-800" />
          Admin Dashboard
        </div>

        <nav className="px-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-orange-800 text-white translate-x-1"
                    : "bg-orange-200 text-orange-800 hover:bg-orange-300 hover:translate-x-1"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 m-3 rounded-xl bg-orange-800 text-sm">
          <p className="text-white font-medium">Drafts waiting</p>
          <p className="text-orange-200 mt-1">{draftCount} posts are still drafts.</p>
        </div>
      </aside>
    </>
  );
}