import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { FormDialogProps } from "@/type.ts";

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

export default FormDialog;
