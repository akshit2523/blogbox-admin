import { useState } from "react";
import { EyeDashedIcon, LucideMoveRight, Trash2 } from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import { DeleteModal } from "./DeleteBlogModel";
import { toast } from "react-toastify";
import BlogService from "../services/blog.service";

const statusStyle = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-200 text-slate-600",
  scheduled: "bg-amber-100 text-amber-700",
};

export default function BlogsTable({
  rows,
  leaving,
}) {

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-y border-slate-100">
            <th className="px-5 py-3 font-medium">Title</th>
            <th className="px-5 py-3 font-medium">Title</th>
            <th className="px-3 py-3 text-center font-medium hidden md:table-cell">
              Author
            </th>
            <th className="px-3 py-3 text-center font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-center">Edit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, index) => (
            <tr
              key={p._id}
              className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${leaving === p.id ? "a-out" : "a-fade"}`}
            >
                <td className="px-3 py-3 text-slate-600 font-display !text-xl !text-orange-800  hidden md:table-cell">
                {index + 1}
              </td>
              <td className="px-5 py-3 text-start font-medium text-slate-900">
                <span className="block text-[14px] font-normal text-slate-400">
                  {moment(p.date).format("MMM D, YYYY")} | {p.readTime}
                </span>
                <span className="block text-lg text-bold !text-orange-800 font-display">
                  {p.name}
                </span>
                <span className="block text-sm font-normal text-slate-400">
                  {p.shortDescription}
                </span>
              </td>
              <td className="px-3 py-3 text-slate-600 hidden md:table-cell">
                {p.author}
              </td>
              <td className="px-3 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle[p.status]}`}
                >
                  {p.status}
                </span>
              </td>
              <td className="px-3 py-3">
                <Link
                  to={`/blogs/${p.slug}`}
                  aria-label={`Edit ${p.name}`}
                  className="inline-flex p-1.5 rounded-md text-slate-400 hover:text-orange-800 hover:bg-orange-100 active:scale-90 transition"
                >
                  <EyeDashedIcon size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-500">
          No posts match your search.{" "}
        </div>
      )}
    </div>
  );
}
