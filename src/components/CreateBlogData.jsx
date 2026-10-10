import { useState, useRef } from "react";
import BlogEditor from "../components/BlogDataEditor";
import {
  getCategoryOptions,
  getTagOptions,
  getStatusOptions,
} from "../utils/utils";
import ImageService from "../services/upload.service";
import BlogService from "../services/blog.service";

export default function CreateBlogData({ close, fetchBlogs }) {
  const [blogData, setBlogData] = useState({
    blocks: [],
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [blogInfo, setBlogInfo] = useState({
    title: "",
    shortDescription: "",
  });

  console.log("blogData", blogData);

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
      setBlogInfo({
        title: "",
        shortDescription: "",
      });
      fetchBlogs();
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

  return (
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

          {coverPreview ? (
            // Image preview after selection
            <div className="w-full">
              <img
                src={coverPreview}
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
              value={blogInfo?.title}
              onChange={(e) => {
                setBlogInfo((prev) => ({ ...prev, title: e.target.value }));
              }}
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
              defaultValue={blogInfo?.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")}
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
            value={blogInfo?.shortDescription}
            onChange={(e) => {
              setBlogInfo((prev) => ({
                ...prev,
                shortDescription: e.target.value,
              }));
            }}
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
            <p className="text-xl font-bold text-orange-800">SEO Information</p>
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
                defaultValue={blogInfo?.title}
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
                defaultValue={blogInfo?.shortDescription}
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

      <BlogEditor
        initialData={blogData}
        onChange={(data) => {
          console.log("Received from child:", data);
          setBlogData(data);
        }}
      />

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
  );
}
