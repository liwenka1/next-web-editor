"use client";

import { useEffect, useRef } from "react";
import Editor, { ElementType, RowFlex } from "@hufe921/canvas-editor";
import { data, options } from "@/mock";

const Site = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<Editor | null>(null);

	useEffect(() => {
		if (containerRef.current) {
			// 初始化编辑器
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
							value: "canvas-editor",
							size: 12,
						},
					],
				},
				options
			);
		}

		// 组件卸载时销毁编辑器
		return () => {
			if (editorRef.current) {
				editorRef.current.destroy();
				editorRef.current = null;
			}
		};
	}, []);

	return <div ref={containerRef} className="canvas-editor" />;
};

export default Site;
