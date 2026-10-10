import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";

import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import ImageTool from "@editorjs/image";
import LinkTool from "@editorjs/link";
import Delimiter from "@editorjs/delimiter";
import Embed from "@editorjs/embed";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";
import Paragraph from "@editorjs/paragraph";
import Table from "@editorjs/table";
import Warning from "@editorjs/warning";
import Marker from "@editorjs/marker";

import ImageService from "../services/upload.service";
import "./BlogDataEditor.css";

export default function BlogDataEditor({ initialData, onChange }) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const previousDataRef = useRef(initialData || { blocks: [] });

  console.log(initialData);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;

    // Give this Editor.js instance its own mount element.
    const mount = document.createElement("div");
    holder.appendChild(mount);

    let editor;

    try {
      editor = new EditorJS({
        holder: mount,

        data: initialData || {
          blocks: [],
        },

        async onChange() {
          try {
            const data = await editor.save();
            const previousData = previousDataRef.current;

            const removedImages = (previousData?.blocks || []).filter(
              (previousBlock) =>
                previousBlock.type === "image" &&
                !(data?.blocks || []).some(
                  (currentBlock) =>
                    currentBlock.type === "image" &&
                    currentBlock.data?.file?.publicId ===
                      previousBlock.data?.file?.publicId,
                ),
            );

            if (removedImages.length) {
              for (const block of removedImages) {
                const publicId = block.data?.file?.publicId;

                if (!publicId) {
                  console.warn("Image publicId not found:", block);
                  continue;
                }

                try {
                  await ImageService.deleteImage(publicId);
                } catch (error) {
                  console.error("Failed to delete image:", publicId, error);
                }
              }
            }

            previousDataRef.current = data;

            console.log("Calling parent callback");
            onChangeRef.current?.(data);
          } catch (error) {
            console.error("Editor save failed:", error);
          }
        },

        inlineToolbar: ["link", "marker", "bold", "italic"],

        tools: {
          // 1. Heading
          header: {
            class: Header,
            inlineToolbar: true,
            tunes: ["alignmentTune"],
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            },
          },

          // 2. Text alignment
          alignmentTune: {
            class: AlignmentTuneTool,
            config: {
              default: "left",
            },
          },

          // 3. Paragraph
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
            tunes: ["alignmentTune"],
          },

          // 4. Image with Cloudinary upload
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

          // 5. Lists, including nested items
          list: {
            class: List,
            inlineToolbar: true,
            tunes: ["alignmentTune"],
            config: {
              defaultStyle: "unordered",
              maxLevel: 3,
            },
          },

          // 6. Inline links / link previews
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/your-link-preview-endpoint",
            },
          },

          // 7. Quote
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: "Enter a quote",
              captionPlaceholder: "Quote author",
            },
          },

          // 8. Section divider
          delimiter: Delimiter,

          // 9. Embedded media
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                vimeo: true,
              },
            },
          },

          // 10. Table
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            },
          },

          // 11. Warning / note
          warning: {
            class: Warning,
            inlineToolbar: true,
            config: {
              titlePlaceholder: "Note",
              messagePlaceholder: "Enter an important note",
            },
          },

          // 12. Marker / highlighted text
          marker: {
            class: Marker,
            shortcut: "CMD+SHIFT+M",
          },
        },
      });

      editorRef.current = editor;
    } catch (error) {
      mount.remove();
      console.error("Editor initialization failed:", error);
      return;
    }

    return () => {
      editor.isReady
        .then(() => editor.destroy())
        .catch((error) => {
          console.error("Editor cleanup failed:", error);
        })
        .finally(() => {
          mount.remove();

          if (editorRef.current === editor) {
            editorRef.current = null;
          }
        });
    };
  }, []);

  return (
    <div
      ref={holderRef}
      className="min-h-[200px] border rounded-lg text-black p-6"
    />
  );
}
