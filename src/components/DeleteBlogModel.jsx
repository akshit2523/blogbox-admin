import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const TrashIcon = ({ className = "h-[18px] w-[18px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 6m4 5v6m4-6v6" />
  </svg>
);

export function DeleteModal({
  open,
  onClose,
  onConfirm,
  currentSlug = "", // slug of the blog being deleted (text the user must type)
  title = "Delete this item?",
  message = "Are you sure you want to delete this blog?\nTo confirm, type the following text in the input field:",
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  const cancelRef = useRef(null);
  const [ deleteSlug, setDeleteSlug ] = useState('')

  const canDelete =
    !!currentSlug.trim() && deleteSlug.trim() === currentSlug.trim();

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dm-title"
        aria-describedby="dm-desc"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-md
                   dark:border-orange-200 dark:bg-orange-100"
      >
        <div
          className="mb-3.5 grid h-11 w-11 place-items-center rounded-full bg-orange-800 text-orange-200"
        >
          <TrashIcon className="h-[22px] w-[22px]" />
        </div>

        <h2
          id="dm-title"
          className="mb-1.5 !font-display text-lg !font-bold !text-orange-800"
        >
          {title}
        </h2>

        <p
          id="dm-desc"
          className="whitespace-pre-line text-sm leading-relaxed text-slate-700"
        >
          {message}
          <br />
          <span className="font-display font-bold text-orange-800">
            {currentSlug}
          </span>
        </p>

        <input
          type="text"
          placeholder="Enter name"
          autoComplete="off"
          className="my-2 w-full bg-white p-2 font-display font-bold text-orange-800 rounded border border-orange-300"
          value={deleteSlug}
          onChange={(e) => setDeleteSlug(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canDelete && onConfirm()}
        />

        <div className="mt-6 flex justify-end gap-2.5">
          {/* Cancel: always enabled */}
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900
                       hover:bg-slate-50 focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                       dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            {cancelText}
          </button>

          {/* Delete: enabled only when typed text matches the slug */}
          <button
            type="button"
            disabled={!canDelete}
            onClick={onConfirm}
            className="rounded-[10px] border border-orange-900 bg-orange-800 px-3.5 py-2 text-sm text-white
                       hover:bg-orange-700 focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                       disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}