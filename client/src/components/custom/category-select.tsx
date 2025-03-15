import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categorySchema } from "@/schema"
import { RootState } from "@/store/store"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { z } from "zod"
export default function CategorySelect(
    {
        triggerSize = 150,
        defaultValue = "",
        value,
        onChange
    }: {
        triggerSize?: number
        defaultValue?: string,
        value?: string,
        onChange?: (value: string) => void
    }) {
        
    const { categories } = useSelector((state: RootState) => state.category)
    const getFullIds = (initalId: string | undefined, categories: z.infer<typeof categorySchema>[]) => {
        const Ids = []
        let thisCategory = categories.find((category) => category.id === initalId)
        while(thisCategory) {
            Ids.push(thisCategory.id)
            thisCategory = categories.find((category) => category.id === thisCategory?.parentId)
        }
        return Ids.reverse()
    }
    const [currentCategoryIds, setCurrentCategoryIds] = useState<string[]>(getFullIds(defaultValue, categories || []))
    useEffect(() => {
        if(!categories) return
        getFullIds(value, categories) && setCurrentCategoryIds(getFullIds(value, categories))
    }, [value, categories])
    useEffect(() => {
        let returnValue = ""
        if(currentCategoryIds.length === 0){
            returnValue = ""
        }
        else if(currentCategoryIds[currentCategoryIds.length - 1] === 'None'){
            returnValue = currentCategoryIds[currentCategoryIds.length - 2] || ""
        }
        else returnValue = currentCategoryIds[currentCategoryIds.length - 1]
        onChange && onChange(returnValue)
    }, [currentCategoryIds, onChange])
    const getChildCategories = (id: string) => {
        if (!categories) return []
        if(currentCategoryIds.length === 0) {
            return categories.filter((category) => !category.parentId)
        }
        return categories.filter((category) => category.parentId === id)
    }
    const getNameById = (id: string) => {
        if (!categories) return ""
        return categories.find((category) => category.id === id)?.name || ""
    }
    return (
        <div className="flex flex-row gap-5 flex-wrap">
            {currentCategoryIds.map((currentCategoryId, index) => (
                <Select 
                    key={index} 
                    onValueChange={(value) => {
                        if(index === 0) {
                            setCurrentCategoryIds([value])
                            return
                        }
                        const newCurrentCategoryIds = currentCategoryIds.slice(0, index).concat(value)
                        setCurrentCategoryIds(newCurrentCategoryIds)
                    }}
                >
                    <SelectTrigger className={`w-[${triggerSize}px]`}>
                        <SelectValue placeholder={getNameById(currentCategoryId)}/>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100">
                        <SelectGroup>
                            {index > 0 && getChildCategories(currentCategoryIds[index - 1]).map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id}
                                    className="cursor-pointer hover:bg-slate-200"
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                            {index === 0 && categories && categories.filter((category) => !category.parentId).map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id}
                                    className="cursor-pointer hover:bg-slate-200"
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                            <SelectItem value="None" className="cursor-pointer hover:bg-slate-200">None</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ))}
            {categories && categories.length > 0 && getChildCategories(currentCategoryIds[currentCategoryIds.length - 1]).length > 0 &&
                <Select 
                    value = {currentCategoryIds[currentCategoryIds.length - 1]} 
                    onValueChange={(value) => {
                        setCurrentCategoryIds([...currentCategoryIds, value])
                    }}
                >
                    <SelectTrigger className={`w-[${triggerSize}px]`}>
                        <SelectValue placeholder="Select category"/>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100">
                        <SelectGroup>
                            {getChildCategories(currentCategoryIds[currentCategoryIds.length - 1]).map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id}
                                    className="cursor-pointer hover:bg-slate-200"
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                            <SelectItem value="None" className="cursor-pointer hover:bg-slate-200">None</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            }
        </div>
    )
}
