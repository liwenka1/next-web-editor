"use client";

import { useEffect, useRef, useCallback } from "react";
import Editor, { ElementType, RowFlex } from "@hufe921/canvas-editor";
import { data, options } from "@/mock";

const Site = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<Editor | null>(null);
	const painterTimeoutRef = useRef<number | null>(null);
	const isFirstClickRef = useRef(true);

	const isApple =
		typeof navigator !== "undefined" && /Mac OS X/.test(navigator.userAgent);

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
							rowFlex: RowFlex.CENTER,
						},
						{
							value: "\n门诊病历",
							size: 18,
							rowFlex: RowFlex.CENTER,
						},
						{
							value: "\n",
							type: ElementType.SEPARATOR,
						},
					],
					main: data,
					footer: [
						{
							value: "李文凯",
							size: 12,
							rowFlex: RowFlex.CENTER,
						},
					],
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
					isDblclick: false,
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
			isDblclick: true,
		});
	}, []);

	const handleFormat = useCallback(() => {
		console.log("format");
		editorRef.current?.command.executeFormat();
	}, []);

	return (
		<div className="editor-container">
			{/* 工具栏 */}
			<div className="toolbar">
				<div
					className="menu-item__undo"
					title={`撤销(${isApple ? "⌘" : "Ctrl"}+Z)`}
					onClick={handleUndo}
				>
					撤销
				</div>
				<div
					className="menu-item__redo"
					title={`重做(${isApple ? "⌘" : "Ctrl"}+Y)`}
					onClick={handleRedo}
				>
					重做
				</div>
				<div
					className="menu-item__painter"
					onClick={handlePainterClick}
					onDoubleClick={handlePainterDblClick}
				>
					格式刷
				</div>
				<div className="menu-item__format" onClick={handleFormat}>
					清除格式
				</div>
			</div>

			{/* 编辑器容器 */}
			<div ref={containerRef} className="canvas-editor" />
		</div>
	);
};

export default Site;
