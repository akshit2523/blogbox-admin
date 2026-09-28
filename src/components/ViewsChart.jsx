import { weeklyViews, weekDays } from "../data/mockData";

export default function ViewsChart() {
  const w = 600, h = 200, max = 8000;
  const pts = weeklyViews.map((v, i) => [40 + (i * (w - 80)) / 6, h - 30 - (v / max) * (h - 60)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <div className="a-rise bg-white rounded-xl border border-slate-200 p-5" style={{ animationDelay: "250ms" }}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-slate-900">Page views this week</h3>
        <span className="text-sm text-slate-500">{weeklyViews.reduce((a, b) => a + b, 0).toLocaleString()} total</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full mt-4" role="img" aria-label="Line chart of daily page views">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="40" x2={w - 40} y1={30 + i * 47} y2={30 + i * 47} stroke="#e2e8f0" />
        ))}
        <path d={d} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="a-draw" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="4.5" fill="#fff" stroke="#f59e0b" strokeWidth="2.5" className="a-fade" style={{ animationDelay: `${300 + i * 200}ms` }} />
            <text x={p[0]} y={h - 8} textAnchor="middle" fontSize="12" fill="#64748b">{weekDays[i]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
