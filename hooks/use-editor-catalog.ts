import { useState, useCallback } from "react";
import type { Editor, ICatalogItem } from "@hufe921/canvas-editor";

export const useEditorCatalog = (editorRef: React.RefObject<Editor | null>) => {
  const [catalogVisible, setCatalogVisible] = useState(true);
  const [catalogData, setCatalogData] = useState<ICatalogItem[]>([]);

  // 更新目录
  const updateCatalog = useCallback(async () => {
    const catalog = await editorRef.current?.command.getCatalog();
    if (catalog) {
      setCatalogData(catalog);
    }
  }, [editorRef]);

  // 切换目录显示
  const handleCatalogToggle = useCallback(() => {
    setCatalogVisible(!catalogVisible);
    if (!catalogVisible) {
      updateCatalog();
    }
  }, [catalogVisible, updateCatalog]);

  // 定位到目录项
  const handleCatalogItemClick = useCallback(
    (id: string) => {
      editorRef.current?.command.executeLocationCatalog(id);
    },
    [editorRef]
  );

  return {
    catalogVisible,
    catalogData,
    updateCatalog,
    handleCatalogToggle,
    handleCatalogItemClick
  };
};
