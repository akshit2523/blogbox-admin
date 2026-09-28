export default function TopPosts({ posts }) {
  const top = [...posts].sort((a, b) => b.views - a.views).slice(0, 4);
  const max = top[0]?.views || 1;
  return (
    <div className="a-rise bg-white rounded-xl border border-slate-200 p-5" style={{ animationDelay: "350ms" }}>
      <h3 className="font-semibold text-slate-900">Top posts</h3>
      <div className="mt-4 space-y-4">
        {top.map((p, i) => (
          <div key={p.id}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-700 truncate pr-3">{p.title}</span>
              <span className="text-slate-500 tabular-nums">{p.views.toLocaleString()}</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="a-bar h-full rounded-full bg-indigo-500" style={{ width: `${(p.views / max) * 100}%`, animationDelay: `${400 + i * 120}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
