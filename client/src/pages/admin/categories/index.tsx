import { Button } from "@/components/ui/button";
import { categorySchema, categoryWithoutChildrenSchema } from "@/schema";
import { getAllCategories } from "@/store/admin-slice/category";
import { AppDispatch, RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { z } from "zod";
import { FaRegEdit } from "react-icons/fa";
import Loading from "@/components/custom/loading";
import RootCategoryDialog from "@/components/admin/categories/root-category-dialog";
import CustomDropdownMenu from "@/components/custom/custom-dropdown-menu";



export default function Categories() {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, categories} = useSelector(
    (state: RootState) => state.category
  )
  
  const [dialog, setDialog] = useState({
    isOpen: false,
    mode: "ADD" as "ADD" | "EDIT",
  })
  const [rootCategories, setRootCategories] = useState<z.infer<typeof categorySchema>[]>([])
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: "",
      image: "",
      name: "",
      parentId: "",
      children: [] as z.infer<typeof categoryWithoutChildrenSchema>[],
    }
  })
  
  
  const handleTriggerEditDialog = (e: React.MouseEvent<HTMLButtonElement>, category: z.infer<typeof categorySchema>) => {
    e.preventDefault()
    setDialog({mode: "EDIT", isOpen: true})
    form.setValue('name', category.name)
    form.setValue('image', category.image)
    form.setValue('id', category.id)
    form.setValue('parentId', category.parentId)
    form.setValue('children', category.children)
  }
  const handleTriggerAddDialog = () => {
    setDialog({mode: "ADD", isOpen: true})
    form.reset()
  } 
  useEffect(() => {
    const fetchRootCategories = async () => {
      if(categories) {
        setRootCategories(categories.filter((category) => !category.parentId))
        return
      }
      await dispatch(getAllCategories())
    }
    fetchRootCategories()
  }, [dispatch, categories])
  if(isLoading) {
    return <Loading/>
  }
  return (
    <div className="w-full p-10 flex flex-col gap-10">
      <div className="space-y-5">
        <div className="flex flex-row items-center gap-3">
          <h1 className="text-3xl font-semibold">Categories</h1>
          <CustomDropdownMenu>
            <Button className="bg-slate-100 hover:bg-slate-200 font-semibold rounded-md"
              onClick={handleTriggerAddDialog}
            >
                Add New Category
            </Button>
          </CustomDropdownMenu>
        </div>
        <RootCategoryDialog 
          dialog={dialog} 
          setDialog={setDialog} 
          form={form}
        />
      </div>
      <div className="grid grid-cols-5 gap-5">
        {rootCategories?.map((category: z.infer<typeof categorySchema>) => (
          <Link
            to={`/admin/categories/${category.id}`}
            key={category.name} 
            className="relative w-[200px] h-[200px] flex flex-col gap-2 justify-center items-center border-2 border-slate-300 p-2 rounded-lg"
          >
            <img src={category.image} alt="category-image" className="h-20 w-20 object-cover rounded-lg"/>
            <p className="text-xl font-semibold">{category.name}</p>
              <Button
                className="absolute top-1 right-1 w-min h-min p-0"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleTriggerEditDialog(e, category)}
              >
                <FaRegEdit size={20}/>
              </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
