import { useState, useCallback } from "react";
import type { Editor } from "@hufe921/canvas-editor";
import type { SearchResult } from "@/type.ts";

export const useEditorSearch = (editorRef: React.RefObject<Editor | null>) => {
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [replaceKeyword, setReplaceKeyword] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  // 搜索处理函数
  const handleSearch = useCallback(
    (keyword: string) => {
      editorRef.current?.command.executeSearch(keyword || null);
      const result = editorRef.current?.command.getSearchNavigateInfo();
      setSearchResult(result ? { index: result.index, count: result.count } : null);
    },
    [editorRef]
  );

  // 替换处理函数
  const handleReplace = useCallback(() => {
    if (searchKeyword && replaceKeyword && searchKeyword !== replaceKeyword) {
      editorRef.current?.command.executeReplace(replaceKeyword);
    }
  }, [editorRef, searchKeyword, replaceKeyword]);

  // 搜索导航处理函数
  const handleSearchNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        editorRef.current?.command.executeSearchNavigatePre();
      } else {
        editorRef.current?.command.executeSearchNavigateNext();
      }
      const result = editorRef.current?.command.getSearchNavigateInfo();
      setSearchResult(result ? { index: result.index, count: result.count } : null);
    },
    [editorRef]
  );

  return {
    isSearchPanelOpen,
    searchKeyword,
    replaceKeyword,
    searchResult,
    setIsSearchPanelOpen,
    setSearchKeyword,
    setReplaceKeyword,
    handleSearch,
    handleReplace,
    handleSearchNavigate
  };
};
