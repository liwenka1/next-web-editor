import { useRef, useCallback } from "react";
import type Editor from "@hufe921/canvas-editor";

export const useEditorFormat = (editorRef: React.RefObject<Editor | null>) => {
  const painterTimeoutRef = useRef<number | null>(null);
  const isFirstClickRef = useRef(true);
  const colorControlRef = useRef<HTMLInputElement>(null);

  // 撤销操作
  const handleUndo = useCallback(() => {
    console.log("undo");
    editorRef.current?.command.executeUndo();
  }, [editorRef]);

  // 重做操作
  const handleRedo = useCallback(() => {
    console.log("redo");
    editorRef.current?.command.executeRedo();
  }, [editorRef]);

  // 格式刷单击
  const handlePainterClick = useCallback(() => {
    if (isFirstClickRef.current) {
      isFirstClickRef.current = false;
      painterTimeoutRef.current = window.setTimeout(() => {
        console.log("painter-click");
        isFirstClickRef.current = true;
        editorRef.current?.command.executePainter({
          isDblclick: false
        });
      }, 200);
    } else {
      if (painterTimeoutRef.current) {
        window.clearTimeout(painterTimeoutRef.current);
      }
    }
  }, [editorRef]);

  // 格式刷双击
  const handlePainterDblClick = useCallback(() => {
    console.log("painter-dblclick");
    isFirstClickRef.current = true;
    if (painterTimeoutRef.current) {
      window.clearTimeout(painterTimeoutRef.current);
    }
    editorRef.current?.command.executePainter({
      isDblclick: true
    });
  }, [editorRef]);

  // 清除格式
  const handleFormat = useCallback(() => {
    console.log("format");
    editorRef.current?.command.executeFormat();
  }, [editorRef]);

  return {
    painterTimeoutRef,
    isFirstClickRef,
    colorControlRef,
    handleUndo,
    handleRedo,
    handlePainterClick,
    handlePainterDblClick,
    handleFormat
  };
};
