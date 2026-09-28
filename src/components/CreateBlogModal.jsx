import { useState } from "react";
import { X } from "lucide-react";

export default function CreateBlogModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  return (
    <div className="a-fade fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="a-pop w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">New post</h3>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 transition"><X size={18} /></button>
        </div>
        <label className="block mt-4 text-sm text-slate-600">Title
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </label>
           <label className="block mt-4 text-sm text-slate-600">Title
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </label>  
         <label className="block mt-4 text-sm text-slate-600">Title
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </label>
        <label className="block mt-4 text-sm text-slate-600">Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">Cancel</button>
          <button disabled={!title.trim()} onClick={() => onSave(title.trim(), status)} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition">Save post</button>
        </div>
      </div>
    </div>
  );
}
