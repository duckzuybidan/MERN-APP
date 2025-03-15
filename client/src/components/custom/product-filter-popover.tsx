import { IoFilterSharp } from "react-icons/io5"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import CategorySelect from "./category-select"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { toast } from "sonner"
import { ProductWithPage } from "@/schema"
type FilterField = {
  name: "category" | "price" | "updateAt",
  label: string,
}
type PriceOptions = {
  order: ProductWithPage["priceOrder"],
  min: string,
  max: string,
}
type updateAtOptions = {
  order: ProductWithPage["updatedAtOrder"]
}
const filterFields: FilterField[] = [
  {name: "category", label: "Category"},
  {name: "price", label: "Price"},
  {name: "updateAt", label: "Update At"},
]
export default function ProductFilterPopover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterValues, setFilterValues] = useState({
    category: decodeURIComponent(searchParams.get("category") || ""),
    price: {
      order: decodeURIComponent(searchParams.get("price_order") || "none"),
      min: searchParams.get("price_min") || "",
      max: searchParams.get("price_max") || "",
    } as PriceOptions,
    updateAt: {
      order: decodeURIComponent(searchParams.get("updateAt_order") || "none"),
    }
  })
  const handleClear = () => {
    setFilterValues({
      category: "",
      price: {
        order: "none",
        min: "",
        max: "",
      },
      updateAt: {
        order: "none",
      }
    })
    searchParams.delete("category")
    searchParams.delete("page")
    searchParams.delete("price_order")
    searchParams.delete("price_min")
    searchParams.delete("price_max")
    searchParams.delete("updateAt_order")
    setSearchParams(searchParams)
  }
  const handleApply = () => {
    if (searchParams.get("price_min") && searchParams.get("price_max") && Number(filterValues.price.max) < Number(filterValues.price.min)) {
      toast.error("Max price must be greater than min price")
      return
    }
    if (filterValues.category !== "") {
      searchParams.set("category", filterValues.category);
      searchParams.set("page", "1");
  } else {
      searchParams.delete("category");
  }
  
  if (filterValues.price.order !== "none") {
      searchParams.set("price_order", filterValues.price.order);
  } else {
      searchParams.delete("price_order");
  }
  
  if (filterValues.price.min !== "") {
      searchParams.set("price_min", filterValues.price.min);
  } else {
      searchParams.delete("price_min");
  }
  
  if (filterValues.price.max !== "") {
      searchParams.set("price_max", filterValues.price.max);
  } else {
      searchParams.delete("price_max");
  }
  
  if (filterValues.updateAt.order !== "none") {
      searchParams.set("updateAt_order", filterValues.updateAt.order);
  } else {
      searchParams.delete("updateAt_order");
  }  
    setSearchParams(searchParams)
  }
  useEffect(() => {
     setFilterValues({
      category: decodeURIComponent(searchParams.get("category") || ""),
      price: {
        order: decodeURIComponent(searchParams.get("price_order") || "none"),
        min: searchParams.get("price_min") || "",
        max: searchParams.get("price_max") || "",
      } as PriceOptions,
     updateAt: {
        order: decodeURIComponent(searchParams.get("updateAt_order") || "none"),
     }
    })
  }, [searchParams])
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <IoFilterSharp size={30} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-white mx-5 min-w-[300px] space-y-3">
        {filterFields.map((field: FilterField) => (
          <div 
            key={field.name}
            className="flex flex-col gap-2"
          >
            <p className="font-semibold text-[10px]">{field.label}</p>
            {field.name === "category" && (
              <CategorySelect 
                triggerSize={100} 
                defaultValue={filterValues.category}
                value={filterValues.category}
                onChange={(value) => setFilterValues((prev) => ({...prev, [field.name]: value}))}
              />
            )}
            {field.name === "price" && (
              <div className="flex flex-col gap-2">
                <Select 
                  onValueChange={(value) => setFilterValues({...filterValues, price: {...filterValues.price, order: value as PriceOptions["order"]}})}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select order"/>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-100">
                    <SelectGroup>
                      {(["asc", "desc", "none"] as PriceOptions["order"][]).map((order) => (
                        <SelectItem 
                          value={order} 
                          key={order} 
                          className="cursor-pointer hover:bg-slate-200"
                        >
                          {order === "asc" && "Low To High"}
                          {order === "desc" && "High To Low"}
                          {order === "none" && "None"}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="flex flex-row gap-2">
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px]">Min Price(USD)</p>
                    <Input
                      placeholder={"Min Price"}
                      className="p-2 border-2 border-slate-300 focus:border-none"
                      type="number"
                      value={filterValues.price.min}
                      onChange={(e) => setFilterValues({...filterValues, price: {...filterValues.price, min: e.target.value}})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px]">Max Price(USD)</p>
                    <Input
                      placeholder={"Max Price"}
                      className="p-2 border-2 border-slate-300 focus:border-none"
                      type="number"
                      value={filterValues.price.max}
                      onChange={(e) => setFilterValues({...filterValues, price: {...filterValues.price, max: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
            )}
            {field.name === "updateAt" && (
              <div className="flex flex-col gap-2">
                <Select 
                  onValueChange={(value) => setFilterValues({...filterValues, updateAt: {...filterValues.updateAt, order: value as updateAtOptions["order"]}})}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select order"/>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-100">
                    <SelectGroup>
                      {(["asc", "desc", "none"] as updateAtOptions["order"][]).map((order) => (
                        <SelectItem 
                          value={order} 
                          key={order} 
                          className="cursor-pointer hover:bg-slate-200"
                        >
                          {order === "asc" && "New To Old"}
                          {order === "desc" && "Old To New"}
                          {order === "none" && "None"}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ))}
        <div className="w-full flex flex-row justify-end gap-2 mt-10">
          <Button
            className="bg-black text-white p-2"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            className="bg-slate-300 text-black p-2"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
