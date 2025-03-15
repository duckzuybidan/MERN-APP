import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button";
import { useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, categoryWithoutChildrenSchema } from "@/schema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteCategory} from "@/store/admin-slice/category";
import { z } from "zod";
import { toast } from "sonner";
import { FaRegFolderOpen, FaRegEdit } from "react-icons/fa";
import Loading from "@/components/custom/loading";
import NotFound from "@/components/not-found";
import useModalStore from "@/hooks/modal";
import SubCategoryDialog from "@/components/admin/categories/sub-category-dialog";
import CustomDropdownMenu from "@/components/custom/custom-dropdown-menu";
export default function Category() {
  const { isLoading, categories } = useSelector((state: RootState) => state.category)
  const { openModal, closeModal } = useModalStore();
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { "*": currentCategorySlug } = useParams()
  const title = categories?.find((category) => category.id === currentCategorySlug)?.name || ""
  const [dialog, setDialog] = useState({
    isOpen: false,
    mode: "ADD" as "ADD" | "EDIT",
  })
  const [currentCategory, setCurrentCategory] = useState<z.infer<typeof categorySchema> | undefined>(undefined)
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: "",
      name: "",
      image: "",
      parentId: currentCategory?.id || "",
      children: [] as z.infer<typeof categoryWithoutChildrenSchema>[]
    }
  })
  
  const handleDelete = () => {
    if(!currentCategory) return
    dispatch(deleteCategory(currentCategory.id)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
        closeModal()
        navigate('/admin/categories', {
          replace: true
        })
      }
      else {
        toast.error(res.payload.message)
      }
    })
  }
  const handleOpenDeleteModal = () => {
    if(!currentCategory) return
    if(currentCategory?.children.length > 0){
      toast.error("Please delete all sub categories first")
      return
    }
    openModal({type: "DELETE", title: title + " category", onSubmit: handleDelete})
  }
  const handleTriggerEditDialog = (e: React.MouseEvent<HTMLButtonElement>, category: z.infer<typeof categoryWithoutChildrenSchema>) => {
    e.preventDefault()
    setDialog({mode: "EDIT", isOpen: true})
    form.setValue('name', category.name)
    form.setValue('id', category.id)
    form.setValue('parentId', category.parentId)
  }
  const handleTriggerAddDialog = () => {
    setDialog({mode: "ADD", isOpen: true})
    form.reset(defaultValues => ({
      ...defaultValues,
      parentId: currentCategory?.id || "",
    }))
  } 
  useLayoutEffect(() => {
    if(!currentCategorySlug || !categories) return
    const category = categories.find((category) => category.id === currentCategorySlug)
    const children = categories.filter((category) => category.parentId === currentCategorySlug)
    setCurrentCategory({
      id: category?.id || "",
      name: category?.name || "",
      image: category?.image || "",
      parentId: category?.parentId || "",
      children: children
    })
  }, [dispatch, currentCategorySlug, categories])
  if(isLoading) {
    return (
      <Loading/>
    )
  }
  if(!isLoading && !currentCategory) {
    return <NotFound/>
  }
  return (
    <div className="w-full p-10 flex flex-col gap-10">
      <div className="space-y-5">
        <div className="flex flex-row items-center gap-3">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <CustomDropdownMenu>
            <Button 
              className="bg-slate-100 hover:bg-slate-200 font-semibold rounded-md w-full"
              onClick={handleTriggerAddDialog}
            >
                Add Sub Category For {title}
            </Button>
            <div className="bg-black w-full h-[1px] my-1"/>
            <Button className="bg-red-400 hover:bg-red-200 font-semibold rounded-md w-full"
              onClick={handleOpenDeleteModal}
            >
                Delete This Category
            </Button>
          </CustomDropdownMenu>
        </div>
        <SubCategoryDialog
          dialog={dialog}
          setDialog={setDialog}
          title={title}
          form={form}
        />
      </div>
      <div className="grid grid-cols-5 gap-5">
        {currentCategory?.children?.map((category: z.infer<typeof categoryWithoutChildrenSchema>) => (
          <Link
            to={`/admin/categories/${category.id}`}
            key={category.name} 
            className="flex flex-row items-center justify-between p-3 rounded-xl bg-slate-300 hover:bg-slate-200"
          > 
            <div className="flex flex-row items-center gap-2">
              <FaRegFolderOpen size={20}/>
              <p className="text-xl font-semibold">{category.name}</p>
            </div>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleTriggerEditDialog(e, category)}
              className="p-0"
            >
              <FaRegEdit size={20}/>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
