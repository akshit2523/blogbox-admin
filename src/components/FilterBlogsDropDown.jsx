import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const OPTIONS = [
  { value: "all", label: "All posts", dot: "bg-slate-400" },
  { value: "published", label: "Published", dot: "bg-emerald-500" },
  { value: "draft", label: "Draft", dot: "bg-amber-500" },
  { value: "scheduled", label: "Scheduled", dot: "bg-sky-500" },
  { value: "featured", label: "Featured", dot: "bg-purple-500" },
];

export default function FilterBlogsDropDown({
  value,
  onChange,
  options = OPTIONS,
  label = "Status",
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  // close on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const openMenu = () => {
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };

  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(options[active]);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapRef} className="relative self-start">
      {/* trigger */}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="filter-listbox"
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={`group flex min-w-38 items-center gap-2.5 rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/15 ${
          open
            ? "border-slate-300 ring-2 ring-slate-900/10"
            : "border-slate-200"
        }`}
      >
        {/* <span className="text-slate-400">{label}</span> */}
        <span className="flex items-center gap-2 font-medium text-slate-900">
          <span className={`size-2 rounded-full ${selected.dot}`} />
          {selected.label}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`ml-auto text-slate-400 transition-transform duration-300 ease-out ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* panel – always mounted so it can animate in and out */}
      <ul
        id="filter-listbox"
        role="listbox"
        aria-activedescendant={open ? `filter-opt-${active}` : undefined}
        className={`absolute right-0 top-full z-20 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-1 scale-95 opacity-0"
        }`}
      >
        {options.map((opt, i) => {
          const isSelected = opt.value === value;
          return (
            <li
              key={opt.value}
              id={`filter-opt-${i}`}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(opt)}
              style={{ transitionDelay: open ? `${i * 30}ms` : "0ms" }}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200 ${
                open ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
              } ${
                active === i ? "bg-slate-100 text-slate-900" : "text-slate-600"
              } ${isSelected ? "font-medium" : ""}`}
            >
              <span className={`size-2 rounded-full ${opt.dot}`} />
              <span className="flex-1">{opt.label}</span>
              <Check
                size={15}
                strokeWidth={2.25}
                className={`text-slate-900 transition-all duration-300 ${
                  isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
