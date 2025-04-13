import FormDialog from "@/components/form-dialog";

const CodeBlockDialog = ({ onConfirm }: { onConfirm: (data: Record<string, string>) => void }) => (
  <FormDialog title="插入代码块" fields={[{ type: "textarea", label: "代码", name: "code" }]} onConfirm={onConfirm} />
);

export default CodeBlockDialog;
