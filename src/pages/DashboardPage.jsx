import { Eye, Users, FileText, MessageSquare } from "lucide-react";
import StatCard from "../components/StatCard";
// import ViewsChart from "../components/ViewsChart";
// import TopPosts from "../components/TopPosts";
// import CommentList from "../components/CommentList";

export default function DashboardPage({ posts, comments, onApprove, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total Blogs" value={35400} change="+12%" delay={0} />
        <StatCard icon={Users} label="Subscribers" value={2180} change="+4%" delay={80} />
        <StatCard icon={FileText} label="Published posts" value={posts.filter((p) => p.status === "published").length} change="+1" delay={160} />
        <StatCard icon={MessageSquare} label="Comments to review" value={comments.filter((c) => !c.ok).length} change="+2" delay={240} />
      </div>
      {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><ViewsChart /></div>
        <TopPosts posts={posts} />
      </div> */}
      {/* <CommentList comments={comments} onApprove={onApprove} onDelete={onDelete} /> */}
    </div>
  );
}
