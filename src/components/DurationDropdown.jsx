import { useId } from "react"
import {Modal} from "./Modal"
import { useModal } from "@/hooks/useModal"
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

export function DurationDropdown({onChange,value}) {
  // const [durationFilter,setDurationFilter]=useState("")
  const id = useId()
  const {open,openModal,closeModal}=useModal()
//value won't change when clicking Custom... twice

const handleValueChange = (value) => {
  if (value === "4"){
    openModal()
  }
  else{
    // setDurationFilter(value)
    onChange(value)

  }
}
const handleCustomDuration = (e) => {
   e.preventDefault()
    const date = e.target.date.value
    const time = e.target.time.value
    // Handle the custom datetime filter here
    console.log("Custom filter:", { date, time })
    // setDurationFilter([date,time])   //why don't it accept objects?
    onChange([date,time])
    closeModal()
    onChange("1")
  }
  return (
    <div className="*:not-first:mt-2 min-w-[154px] relative !overflow-visible">
      {/* <Label htmlFor={id}>filter by duration</Label> */}
      <Select defaultValue="1" value={value}   onValueChange={handleValueChange} onOpenChange={(open)=>console.log('select opened : ',open)}>
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
      <Modal isOpen={open} onClose={closeModal}>
        <form onSubmit={handleCustomDuration} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="date" className="font-medium">Enter Date</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              className="border rounded-md p-2"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="time" className="font-medium">Enter Time</label>
            <input 
              type="time" 
              id="time" 
              name="time"
              className="border rounded-md p-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

