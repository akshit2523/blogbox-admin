import { X } from "lucide-react";
import CreateBlogData from "./CreateBlogData";

export default function CreateBlogModal({ onClose, getBlogs }) {
  return (
    <div
      className="a-fade fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      // onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="design-scrollbar a-pop w-full max-w-3/4 h-11/12 overflow-y-auto flex flex-col bg-white rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-1.5 rounded-lg self-end hover:bg-slate-100 transition"
        >
          <X size={18} />
        </button>
        <h3 className="!mb-8 !mt-2 text:lg lg:text-2xl text-center !font-bold !text-orange-800">
          Create Blog
        </h3>
        <CreateBlogData close={onClose} fetchBlogs={getBlogs} />
      </div>
    </div>
  );
}
