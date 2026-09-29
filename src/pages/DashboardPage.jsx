import { useState, useEffect, useMemo } from "react";
import StatCard from "../components/StatCard";
import BlogService from "../services/blog.service.js";
import { Eye, Users, FileText, MessageSquare, FolderOpen, CheckCircle2, PenLine } from "lucide-react";
// import ViewsChart from "../components/ViewsChart";
// import TopPosts from "../components/TopPosts";
// import CommentList from "../components/CommentList";

export default function DashboardPage({
  posts,
  comments,
  onApprove,
  onDelete,
}) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

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

  function getBlogsByCategory(blogs) {
    const categories = [
      ...new Set(blogs?.map((p) => p?.category).filter(Boolean)),
    ];

    return categories.map((category) => {
      const categoryBlogs = blogs.filter((p) => p?.category === category);
      const publishedBlogCount = categoryBlogs.filter(
        (p) => p.status === "published",
      ).length;
      const draftBlogCount = categoryBlogs.filter(
        (p) => p.status === "draft",
      ).length;

      return {
        category,
        data: {
          publishedBlogCount,
          draftBlogCount,
          totalBlogs: categoryBlogs.length,
        },
      };
    });
  }

  const blogList = useMemo(() => getBlogsByCategory(blogs), [blogs]);

  const lastWeekCount = blogs?.filter((p) => {
    if (!p?.createdOn) return false;
    const createdDate = new Date(p.createdOn);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  }).length;

  // function getStartOfWeek(weekStartsOn = 1) {
  //   // weekStartsOn: 0 = Sunday, 1 = Monday
  //   const now = new Date();
  //   const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  //   const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  //   const start = new Date(now);
  //   start.setDate(now.getDate() - diff);
  //   start.setHours(0, 0, 0, 0);
  //   return start;
  // }

  // const startOfWeek = getStartOfWeek(1); // 1 = week starts Monday

  // const thisWeekCount =
  //   blogs?.filter((p) => {
  //     if (!p?.createdOn) return false;
  //     return new Date(p.createdOn) >= startOfWeek;
  //   }).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <style>{`
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .row-in {
          opacity: 0;
          animation: rowIn 0.4s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .row-in { animation: none; opacity: 1; }
        }
      `}</style>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="Total Blogs"
          value={blogs?.length}
          change="Total Blog Count"
          delay={0}
        />
        <StatCard
          icon={Users}
          label="Published Blogs"
          value={blogs?.filter((b) => b?.status === "published")?.length}
          change="Total Published Blog Count"
          delay={80}
        />
        <StatCard
          icon={FileText}
          label="Draft Blogs"
          value={blogs?.filter((p) => p.status === "draft").length}
          change="Total Draft Blog Count"
          delay={160}
        />
        <StatCard
          icon={MessageSquare}
          label="Blog Count"
          value={lastWeekCount}
          change="This Week Published Count"
          delay={240}
        />
      </div>
      <div className="overflow-x-auto">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* header strip */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white px-5 py-4">
            <FolderOpen size={18} className="text-orange-700" />
            <h3 className="font-display font-semibold text-slate-900">
              Blogs by category
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-5 py-3 text-start font-medium">No.</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 text-center font-medium hidden md:table-cell">
                    Published
                  </th>
                  <th className="px-3 py-3 text-center font-medium">Draft</th>
                  <th className="px-5 py-3 font-medium text-center">Total</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">
                    Mix
                  </th>
                </tr>
              </thead>

              <tbody>
                {blogList?.map((c, index) => {
                  const published = c?.data?.publishedBlogCount ?? 0;
                  const draft = c?.data?.draftBlogCount ?? 0;
                  const total = c?.data?.totalBlogs ?? published + draft;
                  const publishedPct = total
                    ? Math.round((published / total) * 100)
                    : 0;

                  return (
                    <tr
                      key={c?.category ?? index}
                      style={{ animationDelay: `${index * 60}ms` }}
                      className="row-in group border-b border-slate-50 transition-all duration-200
                             hover:bg-orange-50/50 hover:shadow-[inset_3px_0_0_0_theme(colors.orange.500)]"
                    >
                      <td className="px-5 py-4 text-start font-medium text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td className="px-5 py-4 text-start">
                        <span className="inline-flex items-start text-start gap-2 text-[18px] font-bold text-orange-800 font-display">
                          {/* <FileText
                            size={15}
                            className="text-orange-400 transition-transform duration-200 group-hover:scale-110"
                          /> */}
                          {c?.category}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-center hidden md:table-cell">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={13} />
                          {published}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <PenLine size={13} />
                          {draft}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center text-lg font-bold text-slate-900 font-display">
                        {total}
                      </td>

                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-orange-500 transition-all duration-700 ease-out"
                              style={{ width: `${publishedPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">
                            {publishedPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {blogList?.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-400"
                    >
                      No categories yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><ViewsChart /></div>
        <TopPosts posts={posts} />
      </div> */}
      {/* <CommentList comments={comments} onApprove={onApprove} onDelete={onDelete} /> */}
    </div>
  );
}
