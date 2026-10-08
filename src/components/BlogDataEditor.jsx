import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import ImageTool from "@editorjs/image";
import ImageService from "../services/upload.service";
import "./BlogDataEditor.css";

export default function BlogDataEditor({ initialData, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: "blog-editor",

      data: initialData || {
        blocks: [],
      },

      tools: {
        header: {
          class: Header,
          config: {
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },

        list: {
          class: List,
          inlineToolbar: true,
        },

        quote: {
          class: Quote,
          inlineToolbar: true,
        },

        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(file) {
                const result = await ImageService.uploadImage(file);

                if (result.success !== 1) {
                  throw new Error(result.message || "Image upload failed");
                }

                return {
                  success: 1,
                  file: {
                    url: result.data.url,
                    publicId: result.data.publicId,
                  },
                };
              },
            },
          },
        },
      },

      async onChange() {
        const data = await editor.save();

        onChange(data);
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
      }

      editorRef.current = null;
    };
  }, []);

  return (
    <div
      id="blog-editor"
      className="min-h-[500px] border rounded-lg text-black p-6"
    />
  );
}
