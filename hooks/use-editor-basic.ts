import { useRef, useCallback, useState } from "react";
import type Editor from "@hufe921/canvas-editor";
import { EditorMode, PageMode, PaperDirection } from "@hufe921/canvas-editor";
import type { EditorCommand } from "@/type.ts";

const MODE_LIST = [
  { mode: EditorMode.EDIT, name: "编辑模式" },
  { mode: EditorMode.CLEAN, name: "清洁模式" },
  { mode: EditorMode.READONLY, name: "只读模式" },
  { mode: EditorMode.FORM, name: "表单模式" },
  { mode: EditorMode.PRINT, name: "打印模式" },
  { mode: EditorMode.DESIGN, name: "设计模式" }
];

export const useEditorBasic = () => {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageMode, setPageMode] = useState<PageMode>(PageMode.CONTINUITY);
  const [paperDirection, setPaperDirection] = useState<PaperDirection>(PaperDirection.VERTICAL);
  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [editorOptions, setEditorOptions] = useState({});
  const [fullscreen, setFullscreen] = useState(false);

  // 通用命令执行器
  const executeCommand = <T extends keyof EditorCommand>(command: T, ...args: Parameters<EditorCommand[T]>) => {
    return () => {
      // @ts-expect-error 类型推断需要
      editorRef.current?.command[command](...args);
    };
  };

  // 页面模式切换
  const handlePageModeChange = useCallback((mode: PageMode) => {
    setPageMode(mode);
    editorRef.current?.command.executePageMode(mode);
  }, []);

  // 纸张方向设置
  const handlePaperDirection = useCallback((direction: PaperDirection) => {
    setPaperDirection(direction);
    editorRef.current?.command.executePaperDirection(direction);
  }, []);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  }, [fullscreen]);

  // 编辑器配置对话框
  const handleEditorConfig = useCallback(() => {
    const options = editorRef.current?.command.getOptions();
    setEditorOptions(options || {});
  }, []);

  // 编辑器模式切换

  const cycleEditorMode = useCallback(() => {
    setCurrentModeIndex((prev) => (prev + 1) % MODE_LIST.length);
    const newMode = MODE_LIST[currentModeIndex].mode;
    editorRef.current?.command.executeMode(newMode);
    // 更新菜单栏权限视觉反馈
    const isReadonly = newMode === EditorMode.READONLY;
    const enableMenuList = ["search", "print"];
    // 这里需要根据实际DOM选择器调整
    document.querySelectorAll<HTMLDivElement>(".menu-item>div").forEach((dom) => {
      const menu = dom.dataset.menu;
      isReadonly && (!menu || !enableMenuList.includes(menu))
        ? dom.classList.add("disable")
        : dom.classList.remove("disable");
    });
  }, [currentModeIndex]);

  return {
    editorRef,
    containerRef,
    pageMode,
    paperDirection,
    currentModeIndex,
    editorOptions,
    fullscreen,
    MODE_LIST,
    executeCommand,
    handlePageModeChange,
    handlePaperDirection,
    toggleFullscreen,
    handleEditorConfig,
    cycleEditorMode,
    setEditorOptions
  };
};
