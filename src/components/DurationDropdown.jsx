import { useId } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export  function DurationDropdown() {
  const id = useId()
  return (
    <div className="*:not-first:mt-2">
      {/* <Label htmlFor={id}>Select with separator</Label> */}
      <Select defaultValue="1">
        <SelectTrigger id={id}>
          <SelectValue placeholder="By Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Quick Actions</SelectLabel>
            <SelectItem value="1">Newest</SelectItem>
            <SelectItem value="2">Today</SelectItem>
            <SelectItem value="3">Last 7 days</SelectItem>
            <SelectItem value="4">Custom...</SelectItem>   {/*selection happens via the value attribute... that's where the tick goes */}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
