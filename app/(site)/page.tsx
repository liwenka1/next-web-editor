"use client";

import { useEffect } from "react";
import Editor, { ElementType, PageMode, PaperDirection, RowFlex } from "@hufe921/canvas-editor";
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
  Table,
  Search,
  Printer,
  Settings,
  Fullscreen,
  X
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDebounceFn } from "ahooks";
import HyperlinkDialog from "./components/hyperlink-dialog";
import CodeBlockDialog from "./components/code-block-dialog";
import DateFormatMenu from "./components/date-format-menu";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

import type { EditorCommand, MenuItem, ToolItem } from "@/type.ts";

// 导入自定义 hooks
import { useEditorBasic } from "@/hooks/use-editor-basic";
import { useEditorFormat } from "@/hooks/use-editor-format";
import { useEditorInsert } from "@/hooks/use-editor-insert";
import { useEditorSearch } from "@/hooks/use-editor-search";
import { useEditorCatalog } from "@/hooks/use-editor-catalog";

const Site = () => {
  // 使用自定义 hooks
  const {
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
  } = useEditorBasic();

  const { colorControlRef, handleUndo, handleRedo, handlePainterClick, handlePainterDblClick, handleFormat } =
    useEditorFormat(editorRef);

  const {
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
  } = useEditorInsert(editorRef);

  const {
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
  } = useEditorSearch(editorRef);

  const { catalogVisible, catalogData, updateCatalog, handleCatalogToggle } = useEditorCatalog(editorRef);

  const isApple = typeof navigator !== "undefined" && /Mac OS X/.test(navigator.userAgent);

  const handleContentChange = async () => {
    // 这里可以添加字数统计、目录更新等逻辑
    const wordCount = await editorRef.current?.command.getWordCount();
    console.log("Word count:", wordCount);

    if (catalogVisible) {
      updateCatalog();
    }
  };

  const { run } = useDebounceFn(handleContentChange, {
    wait: 200
  });

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

      editorRef.current.listener.contentChange = run;
      editorRef.current.listener.pageModeChange = handlePageModeChange;
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [run, containerRef, handlePageModeChange, editorRef]);

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
      action: handleInsertCheckbox
    },
    {
      icon: <Calendar />,
      label: "日期",
      action: <DateFormatMenu onSelectFormat={handleDateFormatSelect} />
    },
    {
      icon: <Search />,
      label: "搜索替换",
      action: () => setIsSearchPanelOpen(true)
    },
    {
      icon: <Printer />,
      label: "打印",
      action: handlePrint
    }
  ];

  return (
    <div className="container mx-auto h-full w-full">
      {/* 工具栏 */}

      <div className="bg-background/60 sticky top-0 z-50 flex w-full items-center justify-center gap-4 pt-2 pb-4 backdrop-blur">
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

        {isSearchPanelOpen && (
          <div className="absolute rounded-md bg-white p-4 shadow-lg" style={{ top: "100%", right: 0 }}>
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="搜索"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  handleSearch(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchKeyword)}
              />
              <Button variant="ghost" onClick={() => setIsSearchPanelOpen(false)}>
                ×
              </Button>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Input placeholder="替换" value={replaceKeyword} onChange={(e) => setReplaceKeyword(e.target.value)} />
              <Button onClick={handleReplace}>替换</Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => handleSearchNavigate("prev")} disabled={!searchResult}>
                  ↑
                </Button>
                <span>{searchResult ? `${searchResult.index}/${searchResult.count}` : "0/0"}</span>
                <Button variant="ghost" onClick={() => handleSearchNavigate("next")} disabled={!searchResult}>
                  ↓
                </Button>
              </div>
            </div>
          </div>
        )}

        <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      <div>
        {/* 目录面板（固定在左侧） */}
        {catalogVisible && (
          <div className="fixed flex w-64 flex-col">
            <div className="flex items-center justify-between border-b p-2">
              <span className="font-medium">目录</span>
              <Button variant="ghost" size="icon" onClick={handleCatalogToggle}>
                <X size={16} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {catalogData.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer rounded px-2 py-1 hover:bg-gray-100"
                  onClick={() => editorRef.current?.command.executeLocationCatalog(item.id)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 编辑器容器 */}
        <div ref={containerRef} className="canvas-editor flex flex-1 items-center justify-center border shadow-2xs" />
      </div>

      {/* 设置栏 */}
      <div className="bg-background/60 sticky bottom-0 z-50 flex w-full items-center justify-center gap-4 pt-2 pb-4 backdrop-blur">
        {/* 目录开关 */}
        <Button variant="ghost" onClick={handleCatalogToggle}>
          {catalogVisible ? "隐藏目录" : "显示目录"}
        </Button>

        {/* 编辑器配置 */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" onClick={handleEditorConfig}>
              <Settings size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑器配置</DialogTitle>
            </DialogHeader>
            <Textarea
              className="max-h-96 overflow-auto"
              value={JSON.stringify(editorOptions, null, 2)}
              onChange={(e) => setEditorOptions(JSON.parse(e.target.value))}
            />
            <Button onClick={() => editorRef.current?.command.executeUpdateOptions(editorOptions)}>应用配置</Button>
          </DialogContent>
        </Dialog>

        {/* 页面模式选择 */}
        <Select value={pageMode} onValueChange={(value) => handlePageModeChange(value as PageMode)}>
          <SelectTrigger className="w-[180px]">{pageMode}</SelectTrigger>
          <SelectContent>
            {Object.values(PageMode).map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 全屏按钮 */}
        <Button variant="ghost" onClick={toggleFullscreen}>
          <Fullscreen size={16} />
          {fullscreen ? "退出全屏" : "全屏"}
        </Button>

        {/* 编辑器模式切换 */}
        <Button variant="ghost" onClick={cycleEditorMode}>
          {MODE_LIST[currentModeIndex].name}
        </Button>

        {/* 纸张方向 */}
        <Select value={paperDirection} onValueChange={(value) => handlePaperDirection(value as PaperDirection)}>
          <SelectTrigger className="w-[180px]">{paperDirection}</SelectTrigger>
          <SelectContent>
            {Object.values(PaperDirection).map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Site;
