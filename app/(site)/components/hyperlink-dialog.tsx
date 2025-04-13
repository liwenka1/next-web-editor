import FormDialog from "@/components/form-dialog";

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

export default HyperlinkDialog;
