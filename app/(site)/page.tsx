"use client";

import { useEffect, useRef, useCallback } from "react";
import Editor, { ElementType, RowFlex } from "@hufe921/canvas-editor";
import { CornerUpLeft, CornerUpRight, Paintbrush, Eraser } from "lucide-react";

import { data, options } from "@/mock";
import { Button } from "@/components/ui/button";

const Site = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const painterTimeoutRef = useRef<number | null>(null);
  const isFirstClickRef = useRef(true);

  const isApple = typeof navigator !== "undefined" && /Mac OS X/.test(navigator.userAgent);

  // 初始化编辑器
  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = new Editor(
        containerRef.current,
        {
          header: [
            {
              value: "第一人民医院",
              size: 32,
              rowFlex: RowFlex.CENTER
            },
            {
              value: "\n门诊病历",
              size: 18,
              rowFlex: RowFlex.CENTER
            },
            {
              value: "\n",
              type: ElementType.SEPARATOR
            }
          ],
          main: data,
          footer: [
            {
              value: "李文凯",
              size: 12,
              rowFlex: RowFlex.CENTER
            }
          ]
        },
        options
      );
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // 操作处理函数
  const handleUndo = useCallback(() => {
    console.log("undo");
    editorRef.current?.command.executeUndo();
  }, []);

  const handleRedo = useCallback(() => {
    console.log("redo");
    editorRef.current?.command.executeRedo();
  }, []);

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
  }, []);

  const handlePainterDblClick = useCallback(() => {
    console.log("painter-dblclick");
    isFirstClickRef.current = true;
    if (painterTimeoutRef.current) {
      window.clearTimeout(painterTimeoutRef.current);
    }
    editorRef.current?.command.executePainter({
      isDblclick: true
    });
  }, []);

  const handleFormat = useCallback(() => {
    console.log("format");
    editorRef.current?.command.executeFormat();
  }, []);

  return (
    <div className="container mx-auto w-full p-8">
      {/* 工具栏 */}
      <div className="flex items-center justify-center gap-4">
        <div title={`撤销(${isApple ? "⌘" : "Ctrl"}+Z)`} onClick={handleUndo}>
          <Button size="icon" variant="ghost">
            <CornerUpLeft />
          </Button>
        </div>
        <div title={`重做(${isApple ? "⌘" : "Ctrl"}+Y)`} onClick={handleRedo}>
          <Button size="icon" variant="ghost">
            <CornerUpRight />
          </Button>
        </div>
        <div onClick={handlePainterClick} onDoubleClick={handlePainterDblClick}>
          <Button size="icon" variant="ghost">
            <Paintbrush />
          </Button>
        </div>
        <div onClick={handleFormat}>
          <Button size="icon" variant="ghost">
            <Eraser />
          </Button>
        </div>
      </div>

      {/* 编辑器容器 */}
      <div ref={containerRef} className="canvas-editor flex items-center justify-center border shadow-2xs" />
    </div>
  );
};

export default Site;
