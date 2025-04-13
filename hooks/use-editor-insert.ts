import { useRef, useCallback, useState } from "react";
import { ElementType } from "@hufe921/canvas-editor";
import type { Editor } from "@hufe921/canvas-editor";

export const useEditorInsert = (editorRef: React.RefObject<Editor | null>) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [tableSelection, setTableSelection] = useState({ rows: 0, cols: 0 });
  const [isTablePanelOpen, setIsTablePanelOpen] = useState(false);

  // 图片上传处理
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          editorRef.current?.command.executeImage({
            value: reader.result as string,
            width: img.width,
            height: img.height
          });
        };
      };
      reader.readAsDataURL(file);
    },
    [editorRef]
  );

  // 超链接处理函数
  const handleHyperlinkInsert = useCallback(
    (data: Record<string, string>) => {
      editorRef.current?.command.executeHyperlink({
        type: ElementType.HYPERLINK,
        value: data.text,
        url: data.url
      });
    },
    [editorRef]
  );

  // 代码块处理函数
  const handleCodeBlockInsert = useCallback(
    (data: Record<string, string>) => {
      // 这里需要实现代码高亮逻辑
      editorRef.current?.command.executeInsertElementList([{ type: ElementType.CONTROL, value: data.code }]);
    },
    [editorRef]
  );

  // 日期格式处理函数
  const handleDateFormatSelect = useCallback(
    (format: string) => {
      const date = new Date().toISOString();
      editorRef.current?.command.executeInsertElementList([
        {
          type: ElementType.DATE,
          dateFormat: format,
          value: date
        }
      ]);
    },
    [editorRef]
  );

  // 插入复选框
  const handleInsertCheckbox = useCallback(() => {
    editorRef.current?.command.executeInsertElementList([
      {
        type: ElementType.CHECKBOX,
        checkbox: { value: false },
        value: ""
      }
    ]);
  }, [editorRef]);

  // 打印处理函数
  const handlePrint = useCallback(() => {
    editorRef.current?.command.executePrint();
  }, [editorRef]);

  return {
    imageInputRef,
    tableSelection,
    isTablePanelOpen,
    handleImageUpload,
    handleHyperlinkInsert,
    handleCodeBlockInsert,
    handleDateFormatSelect,
    handleInsertCheckbox,
    handlePrint,
    setTableSelection,
    setIsTablePanelOpen
  };
};
