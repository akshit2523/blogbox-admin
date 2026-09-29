import { TrendingUp } from "lucide-react";
import useCountUp from "../hooks/useCountUp";

export default function StatCard({ icon: Icon, label, value, change, delay = 0 }) {
  const n = useCountUp(value);
  return (
    <div className="a-rise bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-lg !font-display">{label}</span>
        <Icon size={18} />
      </div>
      <p className="!mt-6 text-5xl font-semibold  text-slate-900 tabular-nums">{n.toLocaleString()}</p>
      <p className="!mt-4 !text-xs text-emerald-600 !font-sans flex items-center gap-1">{change}</p>
    </div>
  );
}
