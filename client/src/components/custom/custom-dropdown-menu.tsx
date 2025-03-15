import { Button } from "@/components/ui/button"
import { useState } from "react";
import { IoIosArrowDropdown } from "react-icons/io";
export default function CustomDropdownMenu({children}: {children: React.ReactNode}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative z-40">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <IoIosArrowDropdown className="rotate-180" />
        ) : (
          <IoIosArrowDropdown />
        )}
      </Button>
      {open && 
        <div className="absolute top-[110%] left-0 bg-white shadow-md p-1 rounded-md"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      }
    </div>
  )
}
