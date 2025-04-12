"use client";

import { useEffect, useRef, useCallback } from "react";
import Editor, { ElementType, RowFlex } from "@hufe921/canvas-editor";
import { CornerUpLeft, CornerUpRight, Paintbrush, Eraser } from "lucide-react";

import { data, options } from "@/mock";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Site = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const painterTimeoutRef = useRef<number | null>(null);
  const colorControlRef = useRef<HTMLInputElement>(null);
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

  // 通用命令执行器
  const executeCommand = (command: keyof Editor["command"], ...args: any[]) => {
    return () => {
      // @ts-ignore
      editorRef.current?.command[command](...args);
    };
  };

  // 渲染下拉菜单项
  const renderMenuItems = (items: Array<{ label: string; value: any; title?: string }>, command: string) => (
    <DropdownMenuContent>
      {items.map((item) => (
        <DropdownMenuItem
          key={item.value}
          onSelect={() => executeCommand(command as any, item.value)()}
          title={item.title}
        >
          {item.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );

  return (
    <div className="container mx-auto w-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-4">
        {/* 撤销/重做 */}
        <Button size="icon" variant="ghost" title={`撤销(${isApple ? "⌘" : "Ctrl"}+Z)`} onClick={handleUndo}>
          <CornerUpLeft />
        </Button>
        <Button size="icon" variant="ghost" title={`重做(${isApple ? "⌘" : "Ctrl"}+Y)`} onClick={handleRedo}>
          <CornerUpRight />
        </Button>

        <Button size="icon" variant="ghost" onClick={handlePainterClick} onDoubleClick={handlePainterDblClick}>
          <Paintbrush />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleFormat}>
          <Eraser />
        </Button>

        {/* 字体 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">字体</Button>
          </DropdownMenuTrigger>
          {renderMenuItems(
            [
              { label: "宋体", value: "SimSun" },
              { label: "黑体", value: "SimHei" }
              // ...其他字体选项
            ],
            "executeFont"
          )}
        </DropdownMenu>

        {/* 字号 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">字号</Button>
          </DropdownMenuTrigger>
          {renderMenuItems(
            [
              { label: "12px", value: 12 },
              { label: "14px", value: 14 }
              // ...其他字号选项
            ],
            "executeSize"
          )}
        </DropdownMenu>

        {/* 文字样式 */}
        <Button variant="ghost" title={`加粗(${isApple ? "⌘" : "Ctrl"}+B)`} onClick={executeCommand("executeBold")}>
          B
        </Button>
        <Button variant="ghost" title={`斜体(${isApple ? "⌘" : "Ctrl"}+I)`} onClick={executeCommand("executeItalic")}>
          I
        </Button>

        {/* 颜色选择 */}
        <Button className="relative" variant="ghost" onClick={() => colorControlRef.current?.click()}>
          颜色
          <input
            type="color"
            ref={colorControlRef}
            onChange={(e) => executeCommand("executeColor", e.target.value)()}
            className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 opacity-0"
          />
        </Button>

        {/* 对齐方式 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">对齐</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(RowFlex).map(([key, value]) => (
              <DropdownMenuItem key={key} onSelect={executeCommand("executeRowFlex", value)}>
                {key}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 编辑器容器 */}
      <div ref={containerRef} className="canvas-editor flex items-center justify-center border shadow-2xs" />
    </div>
  );
};

export default Site;
