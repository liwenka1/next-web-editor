import type Editor from "@hufe921/canvas-editor";

export type EditorCommand = Editor["command"];

export interface MenuItem {
  label: string;
  value: string | number;
  title?: string;
}

export interface ToolItem {
  icon: React.ReactNode;
  label: string;
  action: React.ReactNode | (() => void);
}

export interface SearchResult {
  index: number;
  count: number;
}

export interface FormDialogProps {
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
