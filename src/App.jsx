import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import BlogsPage from "./pages/BlogsPage";
import EditBlogPage from "./pages/EditBlogPage";
import CommentsPage from "./pages/CommentsPage";
import { initialPosts, initialComments } from "./data/mockData";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const titles = { "/": "Dashboard", "/posts": "Posts", "/comments": "Comments" };

export default function App() {
  const location = useLocation();

  const [posts, setPosts] = useState(initialPosts);
  const [comments, setComments] = useState(initialComments);
  const [menu, setMenu] = useState(false);

  const togglePost = (id) => {
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "published" ? "draft" : "published" }
          : p,
      ),
    );
    toast.success("Post status updated");
  };

  const deletePost = (id) => {
    setPosts((ps) => ps.filter((p) => p.id !== id));
    toast.success("Post deleted");
  };
  const approveComment = (id) => {
    setComments((cs) => cs.map((c) => (c.id === id ? { ...c, ok: true } : c)));
    toast.success("Comment approved");
  };
  const deleteComment = (id) => {
    setComments((cs) => cs.filter((c) => c.id !== id));
    toast.success("Comment deleted");
  };


const title = location.pathname.startsWith("/blogs/")
  ? "Edit blog"
  : titles[location.pathname] ?? "Not found";

  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-800">
      <Sidebar
        open={menu}
        onClose={() => setMenu(false)}
        draftCount={posts.filter((p) => p.status === "draft").length}
      />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <Header
          title={title}
          onMenu={() => setMenu(true)}
        />

        <main key={location.pathname} className="a-fade p-4 sm:p-8">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  posts={posts}
                  comments={comments}
                  onApprove={approveComment}
                  onDelete={deleteComment}
                />
              }
            />
            <Route
              path="/blogs"
              element={
                <BlogsPage
                  posts={posts}
                  onToggle={togglePost}
                  onDelete={deletePost}
                />
              }
            />
            <Route
              path="/blogs/:slug"
              element={
                <EditBlogPage/>
              }
            />
            <Route
              path="/comments"
              element={
                <CommentsPage
                  comments={comments}
                  onApprove={approveComment}
                  onDelete={deleteComment}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>


          <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />
      {/* <ToastStack toasts={toasts} /> */}
    </div>
  );
}
