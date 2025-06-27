import { useId } from "react"
import {Modal} from "./Modal"
import { useModal } from "@/hooks/useModal"
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const DurationDropdown = ({ 
  options = [{
    value:"1",label:"Newest"
  },{
    value:"2",label:"Today"
  },{
    value:"3",label:"Last 7 Days"
  },{
    value:"4",label:"Custom..."
  }], 
  placeholder = "Select a duration",
  value="1",
  onChange
}) => {
  const id = useId()
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value || "1");
  const selectRef = useRef(null);
  const {open,openModal,closeModal}=useModal()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const handleSelect = (value) => {
    setSelectedOption(value);
    console.log("selected : ",value)
    if (value === "4"){
    openModal()
    }
    else{
      onChange?.(value);
    }
    setIsOpen(false);
  };

const handleCustomDuration = (e) => {
   e.preventDefault()
    const date = e.target.date.value
    const time = e.target.time.value
    // Handle the custom datetime filter here
    console.log("Custom filter:", { date, time })
    // setDurationFilter([date,time])   //why don't it accept objects?
    onChange([date,time])
    closeModal()
  }
function getLabelFromValue(value, options) {
  const foundOption = options.find(option => option.value === value);
  return foundOption ? foundOption.label : "Newest";
}

  return (
    <div className="relative w-full max-w-[180px]" ref={selectRef}>
      <div className="relative group">
        <div className="absolute inset-0 rounded-lg blur-xl transition-all duration-500 group-hover:blur-2xl group-hover:opacity-75" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="font-medium text-sm focus-within:border-ring focus-within:ring-ring/50 relative w-full flex items-center justify-between px-4 py-2.25 rounded-lg border border-gray-200 bg-white/70 backdrop-blur-xl shadow-lg transition-all duration-300 group-hover:border-gray-300 group-hover:bg-white/90"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`block truncate ${selectedOption ? 'text-black' : 'text-[var(--secondary-500)]'}`}>
            {getLabelFromValue(selectedOption,options) || placeholder}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="font-medium text-sm absolute z-2 w-full mt-2 rounded-lg shadow-xl border border-gray-100 py-1 backdrop-blur-xl bg-white/90">
          <ul
            className="max-h-60 overflow-auto"
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-2 cursor-pointer transition-colors duration-150
                  ${selectedOption === option.value 
                    ? 'bg-[var(--primary-100)] text-[var(--secondary-900)]' 
                    : 'text-[var(--secondary-500)] hover:bg-[var(--primary-50)]'
                  }`}
                role="option"
                aria-selected={selectedOption === option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
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
};
