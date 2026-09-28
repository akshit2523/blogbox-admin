import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import NewPostModal from "./components/NewPostModal";
import ToastStack from "./components/ToastStack";
import DashboardPage from "./pages/DashboardPage";
import PostsPage from "./pages/PostsPage";
import CommentsPage from "./pages/CommentsPage";
import { initialPosts, initialComments } from "./data/mockData";

const titles = { dashboard: "Dashboard", posts: "Posts", comments: "Comments" };

export default function App() {
  const [view, setView] = useState("dashboard");
  const [posts, setPosts] = useState(initialPosts);
  const [comments, setComments] = useState(initialComments);
  const [modal, setModal] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  };

  const navigate = (id) => { setView(id); setMenu(false); };

  const savePost = (title, status) => {
    setPosts((ps) => [{ id: Date.now(), title, author: "You", status, views: 0, date: "Today" }, ...ps]);
    setModal(false);
    setView("posts");
    toast(status === "published" ? "Published" : "Post saved");
  };
  const togglePost = (id) => {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p)));
    toast("Post status updated");
  };
  const deletePost = (id) => { setPosts((ps) => ps.filter((p) => p.id !== id)); toast("Post deleted"); };
  const approveComment = (id) => { setComments((cs) => cs.map((c) => (c.id === id ? { ...c, ok: true } : c))); toast("Comment approved"); };
  const deleteComment = (id) => { setComments((cs) => cs.filter((c) => c.id !== id)); toast("Comment deleted"); };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      <Sidebar view={view} onNavigate={navigate} open={menu} onClose={() => setMenu(false)} draftCount={posts.filter((p) => p.status === "draft").length} />
      <div className="flex-1 min-w-0">
        <Header title={titles[view]} onMenu={() => setMenu(true)} onNewPost={() => setModal(true)} />
        <main key={view} className="a-fade p-4 sm:p-8 max-w-6xl">
          {view === "dashboard" && <DashboardPage posts={posts} comments={comments} onApprove={approveComment} onDelete={deleteComment} />}
          {view === "posts" && <PostsPage posts={posts} onToggle={togglePost} onDelete={deletePost} onNew={() => setModal(true)} />}
          {view === "comments" && <CommentsPage comments={comments} onApprove={approveComment} onDelete={deleteComment} />}
        </main>
      </div>
      {modal && <NewPostModal onClose={() => setModal(false)} onSave={savePost} />}
      <ToastStack toasts={toasts} />
    </div>
  );
}
