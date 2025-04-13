import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

export default DateFormatMenu;
