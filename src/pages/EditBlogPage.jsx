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
import ImageService from "../services/upload.service";
import { DeleteModal } from "../components/DeleteBlogModel";
import {
  getCategoryOptions,
  getTagOptions,
  getStatusOptions,
} from "../utils/utils";
import BlogEditor from "../components/BlogDataEditor";
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
  const [openDeleteModel, setOpenDeleteModel] = useState(false);
  const [original, setOriginal] = useState(state?.post ?? null);
  const [form, setForm] = useState(state?.post ?? null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "ok" | "error", text }
  const [blogData, setBlogData] = useState({
    blocks: [],
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const uploadedPublicIds = new Set();

    try {
      const formData = new FormData(form);

      const coverFile = formData.get("cover");
      let cover = null;

      // 1. Upload the cover image
      if (coverFile instanceof File && coverFile.size > 0) {
        const uploadResult = await ImageService.uploadImage(coverFile);

        if (uploadResult.success !== 1) {
          throw new Error(uploadResult.message || "Cover image upload failed");
        }

        cover = {
          url: uploadResult.data.url,
          publicId: uploadResult.data.publicId,
          alt: formData.get("title")?.trim() || "",
        };

        if (cover.publicId) {
          uploadedPublicIds.add(cover.publicId);
        }
      }

      // 2. Track images currently in Editor.js content
      for (const block of blogData?.blocks || []) {
        if (block.type === "image" && block.data?.file?.publicId) {
          uploadedPublicIds.add(block.data.file.publicId);
        }
      }

      const categoryName = formData.get("category")?.trim() || "";

      // 3. Prepare the complete blog data
      const finalData = {
        title: formData.get("title")?.trim() || "",
        slug: formData.get("slug")?.trim() || "",
        shortDescription: formData.get("shortDescription")?.trim() || "",
        description: formData.get("description")?.trim() || "",
        readTime: formData.get("readTime")?.trim() || "",

        category: categoryName
          ? {
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
            }
          : {},

        tags: formData.getAll("tags"),
        status: formData.get("status") || "draft",
        featured: formData.get("featured") === "on",

        blogData,
        cover,

        seo: {
          metaTitle: formData.get("metaTitle")?.trim() || "",
          metaDescription: formData.get("metaDescription")?.trim() || "",
          keywords: (formData.get("keywords") || "")
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean),
          canonicalUrl: formData.get("canonicalUrl")?.trim() || "",
          sharedImage: cover,
        },
      };

      // 4. Create the blog
      const response = await BlogService.addBlog(finalData);

      // Adjust this check if your API uses a different response shape.
      if (!response?.data) {
        throw new Error("Blog creation failed: no data returned");
      }

      // 5. Success: keep uploaded images and reset the form
      form.reset();
      setBlogData({ blocks: [] });
      setSelectedTags([]);
      setIsTagsOpen(false);
      setCoverPreview("");
      getBlogBySlug();
      close();

      console.log("Blog created successfully:", response);
    } catch (error) {
      console.error(
        "Blog creation failed:",
        error.response?.data || error.message,
      );

      // 6. Failure: clean up uploaded images
      for (const publicId of uploadedPublicIds) {
        try {
          await ImageService.deleteImage(publicId);
          console.log("Cleaned up image:", publicId);
        } catch (deleteError) {
          console.error("Image cleanup failed:", publicId, deleteError);
        }
      }
    }
  };

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

      <form onSubmit={handleSubmit}>
        {/* Your existing fields */}
        <div className="flex lg:justify-end gap-3 w-full">
          <label
            htmlFor="featured"
            className="text-sm font-bold text-orange-800 cursor-pointer"
          >
            Featured Blog
          </label>

          <input
            type="checkbox"
            id="featured"
            name="featured"
            className="peer sr-only cursor-pointer"
          />

          <label
            htmlFor="featured"
            className="relative h-5 w-10 cursor-pointer rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-orange-800
                               after:absolute after:left-1 after:top-1 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-transform after:duration-200
                               peer-checked:after:translate-x-5"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col w-full gap-2">
            <label
              htmlFor="cover"
              className="block text-sm font-medium text-orange-800"
            />

            {coverPreview || blogData?.cover?.url ? (
              // Image preview after selection
              <div className="w-full">
                <img
                  src={coverPreview || blogData?.cover?.url}
                  alt="Cover image preview"
                  className="w-full h-64 rounded-lg border border-orange-200 object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview("");
                    const input = document.getElementById("cover");
                    if (input) input.value = "";
                  }}
                  className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Remove image
                </button>
              </div>
            ) : (
              // Drag-and-drop upload box
              <label
                htmlFor="cover"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);

                  const file = e.dataTransfer.files?.[0];

                  if (file && file.type.startsWith("image/")) {
                    const input = document.getElementById("cover");

                    if (input) {
                      const transfer = new DataTransfer();
                      transfer.items.add(file);
                      input.files = transfer.files;
                    }

                    setCoverPreview(URL.createObjectURL(file));
                  }
                }}
                className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-orange-800 bg-orange-100"
                    : "border-orange-300 bg-orange-50 hover:border-orange-800 hover:bg-orange-100"
                }`}
              >
                <input
                  type="file"
                  id="cover"
                  name="cover"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file && file.type.startsWith("image/")) {
                      setCoverPreview(URL.createObjectURL(file));
                    } else {
                      setCoverPreview("");
                    }
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mb-3 text-orange-800"
                >
                  <path d="M12 16V4m-5 5 5-5 5 5" />
                  <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
                </svg>
                <span className="text-2xl  font-bold text-orange-800 mb-2">
                  Upload Cover Image
                </span>
                <span className="text-sm font-semibold text-orange-900">
                  Click to upload or drag and drop
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  PNG, JPG, WEBP or GIF
                </span>
              </label>
            )}
          </div>
          <div className="flex flex-col lg:flex-row items-start w-full gap-2">
            <div className="flex flex-col items-start w-full gap-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-orange-800"
              >
                Title
              </label>
              <input
                className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
                type="text"
                id="title"
                name="title"
                defaultValue={blogData?.title}
                placeholder="Blog title"
              />
            </div>
            <div className="flex flex-col items-start w-full gap-2">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-orange-800"
              >
                Slug
              </label>
              <input
                className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
                type="text"
                name="slug"
                id="slug"
                defaultValue={blogData?.slug}
                placeholder="Blog title slug"
              />
            </div>
          </div>
          <div className="flex flex-col items-start w-full gap-2">
            <label
              htmlFor="shortDescription"
              className="block text-sm font-medium text-orange-800"
            >
              Short Description
            </label>
            <input
              className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
              type="text"
              name="shortDescription"
              id="shortDescription"
              defaultValue={blogData?.shortDescription}
              placeholder="Short description"
            />
          </div>
          <div className="flex flex-col items-start w-full gap-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-orange-800"
            >
              Description
            </label>
            <textarea
              className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
              id="description"
              name="description"
              defaultValue={blogData?.description}
              placeholder="Description"
            />
          </div>
          <div className="flex flex-col items-start w-full gap-2">
            <label
              htmlFor="readTime"
              className="block text-sm font-medium text-orange-800"
            >
              Read Time
            </label>
            <input
              className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
              type="text"
              name="readTime"
              id="readTime"
              defaultValue={blogData?.readTime}
              placeholder="Read time"
            />
          </div>
          <div className="flex flex-col lg:flex-row items-center w-full gap-2">
            <div className="flex flex-col items-start w-full gap-2">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-orange-800"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                defaultValue=""
                className="w-full cursor-pointer border border-orange-900 rounded-md py-2 pl-4 pr-10 bg-white focus:outline-none focus:ring-1 focus:ring-orange-800"
                required
              >
                <option value="" disabled>
                  Select category
                </option>

                {getCategoryOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-start w-full gap-2">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-orange-800"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue=""
                className="w-full cursor-pointer border border-orange-900 rounded-md py-2 pl-4 pr-10 bg-white focus:outline-none focus:ring-1 focus:ring-orange-800"
                required
              >
                <option value="" disabled>
                  Select status
                </option>

                {getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative flex w-full flex-col justify-start gap-2">
            <label
              className="text-sm text-start font-medium text-orange-800"
              htmlFor="tag-search"
            >
              Tags
            </label>

            <button
              type="button"
              onClick={() => setIsTagsOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-md border border-orange-900 bg-white px-4 py-3 text-left"
            >
              <span
                className={
                  selectedTags.length ? "text-gray-800" : "text-gray-500"
                }
              >
                {selectedTags.length
                  ? selectedTags
                      .map(
                        (tag) =>
                          getTagOptions().find((option) => option.value === tag)
                            ?.label || tag,
                      )
                      .join(", ")
                  : "Select tags"}
              </span>
              <span>{isTagsOpen ? "⏶" : "⏷"}</span>
            </button>

            {isTagsOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-md border border-orange-200 bg-white shadow-lg">
                {getTagOptions().map((option) => {
                  const checked = selectedTags.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-orange-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedTags((prev) =>
                            checked
                              ? prev.filter((tag) => tag !== option.value)
                              : [...prev, option.value],
                          )
                        }
                        className="accent-orange-800"
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {selectedTags.map((tag) => (
              <input key={tag} type="hidden" name="tags" value={tag} />
            ))}
          </div>
          <div className="flex flex-col items-start w-full gap-2 border border-orange-800 rounded-xl px-4 py-6">
            <div className="flex flex-col items-center w-full gap-2">
              <p className="text-xl font-bold text-orange-800">
                SEO Information
              </p>
            </div>
            <div className="flex flex-col items-start w-full gap-3">
              <div className="flex flex-col items-start w-full gap-2">
                <label
                  htmlFor="metaTitle"
                  className="block text-sm font-medium text-orange-800"
                >
                  Meta Title
                </label>
                <input
                  className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  defaultValue={blogData?.seo?.metaTitle}
                  placeholder="Meta title"
                />
              </div>
              <div className="flex flex-col items-start w-full gap-2">
                <label
                  htmlFor="metaDescription"
                  className="block text-sm font-medium text-orange-800"
                >
                  Meta Description
                </label>
                <textarea
                  className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
                  id="metaDescription"
                  name="metaDescription"
                  defaultValue={blogData?.seo?.metaDescription}
                  placeholder="Meta description"
                />
              </div>
              <div className="flex flex-col items-start w-full gap-2">
                <label
                  htmlFor="keywords"
                  className="block text-sm font-medium text-orange-800"
                >
                  Keywords
                </label>
                <input
                  className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
                  type="text"
                  id="keywords"
                  name="keywords"
                  defaultValue={blogData?.seo?.keywords}
                  placeholder="Keywords"
                />
              </div>
              <div className="flex flex-col items-start w-full gap-2">
                <label
                  htmlFor="canonicalUrl"
                  className="block text-sm font-medium text-orange-800"
                >
                  Canonical URL (Blog Live URL)
                </label>
                <input
                  className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
                  type="text"
                  id="canonicalUrl"
                  name="canonicalUrl"
                  defaultValue={blogData?.seo?.canonicalUrl}
                  placeholder="Canonical URL"
                />
              </div>
              {/* <div className="flex flex-col items-start w-full gap-2">
                    <label
                      htmlFor="sharedImage"
                      className="block text-sm font-medium text-orange-800"
                    >
                      Shared Image (Cover Image URL)
                    </label>
                    <input
                      className="w-full border border-orange-900 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-800"
                      type="text"
                      id="sharedImage"
                      name="sharedImage"
                      placeholder="Shared Image"
                    />
                  </div> */}
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold !text-orange-800">Blog Content</h3>

        {blogData?.blogData?.blocks?.length > 0 && (
          <BlogEditor
            initialData={{
    blocks: blogData?.blogData?.blocks
  }}
            onChange={(data) => {
              console.log("Received from child:", data);
              setBlogData(data);
            }}
          />
        )}

        <div className="flex flex-row justify-end w-full gap-2">
          <button
            type="submit"
            className="mt-8 bg-orange-800 text-white py-2 px-4 rounded-md hover:bg-orange-900 focus:outline-none focus:ring-1 focus:ring-orange-800"
          >
            Save Blog
          </button>
          <button
            type="submit"
            className="mt-8 bg-orange-800 text-white py-2 px-4 rounded-md hover:bg-orange-900 focus:outline-none focus:ring-1 focus:ring-orange-800"
          >
            Publish Blog
          </button>
        </div>
      </form>
    </div>
  );
}
