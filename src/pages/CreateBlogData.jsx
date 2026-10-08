"use client";

import { useState } from "react";
import BlogEditor from "../components/BlogDataEditor";

export default function CreateBlogData() {
  const [blogData, setBlogData] = useState({
    blocks: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const blog = {
      title: "5 Most Beautiful Places to Visit in Switzerland",

      slug: "5-most-beautiful-places-to-visit-in-switzerland",

      category: "Nature",

      description:
        "Discover the most beautiful places in Switzerland.",

      shortDescription:
        "Explore Switzerland's most beautiful destinations.",

      blogData: blogData,

      seo: {
        metaTitle:
          "5 Most Beautiful Places to Visit in Switzerland",

        metaDescription:
          "Discover the most beautiful places to visit in Switzerland.",

        canonicalUrl:
          "https://yourdomain.com/blog/5-most-beautiful-places-to-visit-in-switzerland",
      },
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/blogs`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(blog),
      }
    );

    const result = await response.json();

    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your existing fields */}

      <input
        type="text"
        placeholder="Blog title"
      />

      <textarea
        placeholder="Short description"
      />

      <h3>Blog Content</h3>

      <BlogEditor
        initialData={blogData}
        onChange={setBlogData}
      />

      <button type="submit">
        Publish Blog
      </button>
    </form>
  );
}