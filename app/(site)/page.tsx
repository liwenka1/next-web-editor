"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Editor, { ElementType, RowFlex } from "@hufe921/canvas-editor";
import {
  CornerUpLeft,
  CornerUpRight,
  Paintbrush,
  Eraser,
  Calendar,
  CheckSquare,
  Code,
  Link,
  Image as ImageIcon,
  Table
} from "lucide-react";

import { data, options } from "@/mock";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type EditorCommand = Editor["command"];
interface MenuItem {
  label: string;
  value: string | number;
  title?: string;
}

interface ToolItem {
  icon: React.ReactNode;
  label: string;
  action: React.ReactNode | (() => void);
}

interface FormDialogProps {
  title: string;
  fields: Array<{
    type: "text" | "number" | "textarea" | "select";
    label: string;
    name: string;
    options?: Array<{ label: string; value: string }>;
    required?: boolean;
  }>;
  onConfirm: (data: Record<string, string>) => void;
}

const FormDialog = ({ title, fields, onConfirm }: FormDialogProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">{title}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">{field.label}</label>
              {field.type === "select" ? (
                <select
                  className="col-span-3"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))
                  }
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type}
                  className="col-span-3"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))
                  }
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onConfirm(formData);
              setIsOpen(false);
            }}
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 将这些组件移到 Site 组件外部
const HyperlinkDialog = ({ onConfirm }: { onConfirm: (data: Record<string, string>) => void }) => (
  <FormDialog
    title="插入超链接"
    fields={[
      { type: "text", label: "文本", name: "text", required: true },
      { type: "text", label: "链接", name: "url", required: true }
    ]}
    onConfirm={onConfirm}
  />
);

const CodeBlockDialog = ({ onConfirm }: { onConfirm: (data: Record<string, string>) => void }) => (
  <FormDialog title="插入代码块" fields={[{ type: "textarea", label: "代码", name: "code" }]} onConfirm={onConfirm} />
);

const DateFormatMenu = ({ onSelectFormat }: { onSelectFormat: (format: string) => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost">日期格式</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {["yyyy-MM-dd", "yyyy-MM-dd hh:mm:ss"].map((format) => (
        <DropdownMenuItem key={format} onSelect={() => onSelectFormat(format)}>
          {format}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const Site = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const painterTimeoutRef = useRef<number | null>(null);
  const colorControlRef = useRef<HTMLInputElement>(null);
  const isFirstClickRef = useRef(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [tableSelection, setTableSelection] = useState({ rows: 0, cols: 0 });
  const [isTablePanelOpen, setIsTablePanelOpen] = useState(false);

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
  const executeCommand = <T extends keyof EditorCommand>(command: T, ...args: Parameters<EditorCommand[T]>) => {
    return () => {
      // @ts-expect-error 类型推断需要
      editorRef.current?.command[command](...args);
    };
  };

  // 渲染下拉菜单项
  const renderMenuItems = (items: MenuItem[], command: keyof EditorCommand) => (
    <DropdownMenuContent>
      {items.map((item) => (
        <DropdownMenuItem
          key={item.value.toString()}
          onSelect={() => executeCommand(command, item.value)()}
          title={item.title}
        >
          {item.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );

  // 表格选择逻辑
  const renderTablePanel = () => (
    <div className="absolute bg-white p-2 shadow-lg">
      <div className="grid grid-cols-10 gap-1">
        {Array(10)
          .fill(0)
          .map((_, i) =>
            Array(10)
              .fill(0)
              .map((_, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`h-4 w-4 border ${i < tableSelection.rows && j < tableSelection.cols ? "bg-blue-200" : ""}`}
                  onMouseEnter={() => setTableSelection({ rows: i + 1, cols: j + 1 })}
                />
              ))
          )}
      </div>
      <Button
        onClick={() => {
          editorRef.current?.command.executeInsertTable(tableSelection.rows, tableSelection.cols);
          setIsTablePanelOpen(false);
        }}
      >
        插入 {tableSelection.rows}x{tableSelection.cols} 表格
      </Button>
    </div>
  );

  // 图片上传处理
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  // 超链接处理函数
  const handleHyperlinkInsert = useCallback((data: Record<string, string>) => {
    editorRef.current?.command.executeHyperlink({
      type: ElementType.HYPERLINK,
      value: data.text,
      url: data.url
    });
  }, []);

  // 代码块处理函数
  const handleCodeBlockInsert = useCallback((data: Record<string, string>) => {
    // 这里需要实现代码高亮逻辑
    editorRef.current?.command.executeInsertElementList([{ type: ElementType.CONTROL, value: data.code }]);
  }, []);

  // 日期格式处理函数
  const handleDateFormatSelect = useCallback((format: string) => {
    const date = new Date().toISOString();
    editorRef.current?.command.executeInsertElementList([
      {
        type: ElementType.DATE,
        dateFormat: format,
        value: date
      }
    ]);
  }, []);

  // 添加工具栏项目
  const additionalTools: ToolItem[] = [
    {
      icon: <Table />,
      label: "表格",
      action: () => setIsTablePanelOpen(true)
    },
    {
      icon: <ImageIcon />,
      label: "图片",
      action: () => imageInputRef.current?.click()
    },
    {
      icon: <Link />,
      label: "超链接",
      action: <HyperlinkDialog onConfirm={handleHyperlinkInsert} />
    },
    {
      icon: <Code />,
      label: "代码块",
      action: <CodeBlockDialog onConfirm={handleCodeBlockInsert} />
    },
    {
      icon: <CheckSquare />,
      label: "复选框",
      action: () => {
        editorRef.current?.command.executeInsertElementList([
          {
            type: ElementType.CHECKBOX,
            checkbox: { value: false },
            value: ""
          }
        ]);
      }
    },
    {
      icon: <Calendar />,
      label: "日期",
      action: <DateFormatMenu onSelectFormat={handleDateFormatSelect} />
    }
  ];

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

        {/* 新增工具 */}
        {additionalTools.map((tool, index) => (
          <div key={index} className="relative">
            {typeof tool.action === "function" ? (
              <Button variant="ghost" size="icon" title={tool.label} onClick={tool.action}>
                {tool.icon}
              </Button>
            ) : (
              tool.action
            )}
            {isTablePanelOpen && tool.label === "表格" && renderTablePanel()}
          </div>
        ))}

        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      {/* 编辑器容器 */}
      <div ref={containerRef} className="canvas-editor flex items-center justify-center border shadow-2xs" />
    </div>
  );
};

export default Site;
