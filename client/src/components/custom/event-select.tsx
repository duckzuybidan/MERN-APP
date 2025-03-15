import { Checkbox } from "@/components/ui/checkbox"
import { RootState } from "@/store/store"
import { useSelector } from "react-redux"
import { Button } from "../ui/button"
import { z } from "zod"
import { eventSchema } from "@/schema"
import { useState } from "react"
export default function EventSelect({
  eventIds,
  onChange
}: {
  eventIds: string[],
  onChange: (eventIds: string[]) => void
}) {
  const {events} = useSelector((state: RootState) => state.event)
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button 
        variant="outline"  
        type="button"
        onClick={() => setOpen(!open)}
      >
        Select Events
      </Button>
      <div 
        className={`absolute top-[110%] left-0 w-max max-h-[100px] border-2 p-3 rounded-md bg-slate-100 duration-300 overflow-auto 
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95"}`
        }
      >
        {events && events.length === 0 && <p>No events available</p>}
        {events && events.map((event: z.infer<typeof eventSchema>) => (
          <div 
            key={event.id} 
            className="flex flex-row items-center gap-2 hover:bg-slate-100"
          >
            <Checkbox 
              id={event.id} 
              checked={eventIds.includes(event.id)}
              onCheckedChange={(checked) => {
                if(checked) onChange([...eventIds, event.id])
                else onChange(eventIds.filter((id) => id !== event.id))
              }}
            />
            <p>{event.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
