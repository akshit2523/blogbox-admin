import { useState } from "react";
import { Check, Trash2 } from "lucide-react";

export default function CommentList({ comments, onApprove, onDelete }) {
  const [leaving, setLeaving] = useState(null);
  const remove = (id) => {
    setLeaving(id);
    setTimeout(() => { onDelete(id); setLeaving(null); }, 350);
  };
  return (
    <div className="a-rise bg-white rounded-xl border border-slate-200" style={{ animationDelay: "450ms" }}>
      <h3 className="font-semibold text-slate-900 p-5 pb-3">Comments</h3>
      {comments.length === 0 && <p className="px-5 pb-6 text-sm text-slate-500">No comments yet. New ones will show up here for review.</p>}
      <ul className="divide-y divide-slate-100">
        {comments.map((c) => (
          <li key={c.id} className={`px-5 py-4 flex gap-4 items-start overflow-hidden ${leaving === c.id ? "a-out" : ""}`}>
            <div className="h-9 w-9 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">{c.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900"><span className="font-medium">{c.name}</span> <span className="text-slate-400">on {c.post}</span></p>
              <p className="text-sm text-slate-600 mt-0.5">{c.text}</p>
            </div>
            <div className="flex gap-1">
              {!c.ok && (
                <button onClick={() => onApprove(c.id)} aria-label="Approve comment" className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 active:scale-90 transition"><Check size={16} /></button>
              )}
              <button onClick={() => remove(c.id)} aria-label="Delete comment" className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition"><Trash2 size={16} /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
