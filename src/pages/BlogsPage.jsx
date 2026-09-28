import { useState, useEffect, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import BlogsTable from "../components/BlogsTable.jsx";
import BlogService from "../services/blog.service.js";
import CreateBlogModal from "../components/CreateBlogModal";

export default function PostsPage({ onToggle, onDelete }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [leaving, setLeaving] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreateBlogModel, setOpenCreateBlogModel] = useState(false);

  async function fetchBlogs() {
    try {
      if (loading) return;
      setLoading(true);

      const response = await BlogService.getBlogs();
      setBlogs(response?.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  const rows = useMemo(
    () =>
      blogs.filter(
        (p) =>
          (filter === "all" || p.status === filter) &&
          p?.name?.toLowerCase().includes(search.toLowerCase()),
      ),
    [blogs, search, filter],
  );
  const remove = (id) => {
    setLeaving(id);
    setTimeout(() => {
      onDelete(id);
      setLeaving(null);
    }, 350);
  };
  console.log(openCreateBlogModel);
  return (
    <div>
      {loading ? (
        <div>loading</div>
      ) : (
        <div>
          <button
            onClick={() => setOpenCreateBlogModel(true)}
            className="flex items-center gap-2 mb-3 ml-auto px-4 py-2 rounded-lg bg-orange-800 text-white text-sm font-medium hover:bg-orange-700 hover:shadow-lg active:scale-95 transition-all"
          >
            <Plus size={16} />
            New post
          </button>
          <div className="a-rise bg-white rounded-xl border border-slate-200">
            <div className="p-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="relative sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>

              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start">
                {["all", "published", "draft", "scheduled"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-md text-sm capitalize transition-all ${filter === f ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <BlogsTable
              rows={rows}
              leaving={leaving}
              onToggle={onToggle}
              onDelete={remove}
              getAllBlogs={fetchBlogs}
            />
          </div>
        </div>
      )}
      {openCreateBlogModel && (
        <CreateBlogModal onClose={() => setOpenCreateBlogModel(false)} />
      )}
    </div>
  );
}
