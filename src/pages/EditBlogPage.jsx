import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import BlogService from "../services/blog.service"; // adjust to your path
import { DeleteModal } from "../components/DeleteBlogModel";
import { toast } from "react-toastify";

const STATUSES = ["draft", "published", "scheduled"];
const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-orange-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {hint && <span className="font-normal text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="h-10 bg-orange-100 rounded-lg" />
        <div className="h-20 bg-orange-100 rounded-lg" />
        <div className="h-64 bg-orange-100 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 h-64" />
    </div>
  );
}

export default function EditBlogPage() {
  const { slug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [blogData, setBlogData] = useState(null);
  const [openDeleteModel, setOpenDeleteModel] = useState(false);
  const [original, setOriginal] = useState(state?.post ?? null);
  const [form, setForm] = useState(state?.post ?? null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "ok" | "error", text }

  // If the user refreshed the page, router state is gone, so fetch by slug
  useEffect(() => {
    getBlogBySlug();
  }, [slug]);

  async function getBlogBySlug() {
    try {
      setLoading(true);
      const res = await BlogService.getBlogBySlug(slug);
      setBlogData(res?.data);
      setForm(res?.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(original),
    [form, original],
  );
  const words = (form?.content ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  async function handleSave() {
    if (!form.title?.trim())
      return setMsg({ type: "error", text: "Title is required." });
    setSaving(true);
    setMsg(null);
    try {
      await BlogService.editBlog(form._id ?? form.id, form);
      setOriginal(form);
      setMsg({ type: "ok", text: "Changes saved." });
      setTimeout(() => navigate("/posts"), 900);
    } catch {
      setMsg({ type: "error", text: "Could not save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = async () => {
    try {
      await BlogService.deleteBlog(blogData?._id);

      setOpenDeleteModel(false);
      toast.success("Post deleted updated");
      navigate("/blogs");
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to delete post!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 a-fade">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-sm text-orange-800 hover:gap-3 transition-all"
        >
          <ArrowLeft size={16} /> Back to posts
        </Link>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="a-fade text-xs text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving || !form}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-800 text-white text-sm font-medium hover:bg-orange-900 hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving" : "Save changes"}
          </button>
          <button
            onClick={() => setOpenDeleteModel(true)}
            // onClick={() => onDelete(p.id)}
            aria-label={`Delete ${blogData?.name}`}
            className="p-2.5 border border-orange-800 !text-orange=800 rounded-md hover:text-orange-200 hover:bg-orange-800 active:scale-90 transition"
          >
            <Trash2 size={16} />
          </button>
          <DeleteModal
            open={openDeleteModel}
            onClose={() => setOpenDeleteModel(false)}
            currentSlug={blogData?.slug}
            onConfirm={() => handleDelete()}
          />
        </div>
      </div>

      {msg && (
        <div
          className={`a-pop mb-6 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
          role="status"
        >
          {msg.type === "ok" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {msg.text}
        </div>
      )}

      {loading && <Skeleton />}

      {form && (
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="a-rise lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <Field label="Title">
              <input
                value={form?.name ?? ""}
                onChange={set("title")}
                placeholder="Post title"
                className={`${inputCls} font-display text-lg`}
              />
            </Field>
            <Field
              label="Short description"
              hint={`${(form?.description ?? "").length}/160`}
            >
              <textarea
                rows={2}
                maxLength={160}
                value={form?.description ?? ""}
                onChange={set("description")}
                placeholder="One or two sentences shown in the blog list"
                className={inputCls}
              />
            </Field>
            <Field label="Content" hint={`${words} words`}>
              <textarea
                rows={16}
                value={form?.description ?? ""}
                onChange={set("content")}
                placeholder="Write your post..."
                className={`${inputCls} leading-relaxed`}
              />
            </Field>
          </section>

          <aside
            className="a-rise space-y-6 self-start"
            style={{ animationDelay: "120ms" }}
          >
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-display font-semibold text-slate-900">
                Publishing
              </h3>
              <Field label="Status">
                <select
                  value={form?.status ?? "draft"}
                  onChange={set("status")}
                  className={`${inputCls} capitalize`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <input
                  value={form?.category ?? ""}
                  onChange={set("category")}
                  placeholder="e.g. Design"
                  className={inputCls}
                />
              </Field>
              <Field label="Author">
                <input
                  value={form?.author ?? ""}
                  onChange={set("author")}
                  className={inputCls}
                />
              </Field>
              {/* <p className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={15} /> About {form?.readTime} read */}
              <Field label="Read Time">
                <div className="relative">
                  <input
                    value={form?.readTime ?? ""}
                    onChange={set("readTime")}
                    className={`${inputCls}`}
                  />
                </div>
              </Field>
              {/* </p> */}
            </div>

            <div className="bg-orange-100 rounded-xl p-5 text-sm text-orange-900">
              <p className="font-medium">Slug</p>
              <p className="mt-1 break-all text-orange-800">
                /{form?.slug ?? slug}
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
