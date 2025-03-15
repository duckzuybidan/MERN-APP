import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { categorySchema } from "@/schema";
import { createCategory, updateCategory } from "@/store/admin-slice/category";
import { AppDispatch, RootState } from "@/store/store";
import { useRef } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
type CategoryFormField = {
    name: "image" | "name"
    placeholder: string
    type: "INPUT" | "FILE"
}
type DialogFeild = {
    mode: "ADD" | "EDIT"
    isOpen: boolean
}
const categoryFormFields : CategoryFormField[] = [
    {name: "image", placeholder: "Choose Image", type: "FILE"},
    {name: "name", placeholder: "Name", type: "INPUT"},
]
export default function RootCategoryDialog({
    dialog,
    setDialog,
    form
}: {
    dialog: DialogFeild,
    setDialog: React.Dispatch<React.SetStateAction<DialogFeild>>,
    form: any
}) {
    const categoryImageFileRef = useRef<HTMLInputElement>(null)
    const dispatch = useDispatch<AppDispatch>()
    const { isUpdating } = useSelector(
        (state: RootState) => state.category
    )
    const onSubmit = (data: z.infer<typeof categorySchema>) => {
        if(dialog.mode === "EDIT") {
          dispatch(updateCategory(data)).then((res) => {
            if(res.payload.success) {
              toast.success(res.payload.message)
              setDialog({...dialog, isOpen: false})
              form.reset()
            } 
            else {
              toast.error(res.payload.message)
            }
          })
          return
        }
        dispatch(createCategory(data)).then((res) => {
          if(res.payload.success) {
            toast.success(res.payload.message)
            setDialog({...dialog, isOpen: false})
            form.reset()
          }
          else {
            toast.error(res.payload.message)
          }
        })
    }
    const handleCategoryImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if(!file) {
          return
        }
        if(!file.type.startsWith("image")) {
          toast.error("Please select an image file")
          return
        }
        if(file.size > 1024 * 1024) {
          toast.error("File size should be less than 1MB")
          return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
          form.setValue("image", e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }
    return (
        <Dialog open={dialog.isOpen} onOpenChange={(open) => setDialog((prev) => ({...prev, isOpen: open}))}>
            <DialogContent className="bg-white">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <DialogHeader>
                            <DialogTitle>{dialog.mode === "ADD" ? "Add New Category" : "Edit Category"}</DialogTitle>
                            <DialogDescription>{dialog.mode === "ADD" ? "Add new category" : "Edit category"}</DialogDescription>
                        </DialogHeader>
                        {categoryFormFields.map((formField: CategoryFormField) => (
                            <FormField
                                key={formField.name}
                                control={form.control}
                                name={formField.name}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{formField.name.toUpperCase()}</FormLabel>
                                        <FormControl>
                                            <>
                                                {formField.type === "INPUT" && 
                                                    <Input
                                                        placeholder={formField.placeholder}
                                                        className="p-2 border-2 border-slate-300 focus:border-none"
                                                        {...field}
                                                    />
                                                }
                                                {formField.type === "FILE" && 
                                                    <>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            ref={categoryImageFileRef}
                                                            onChange={handleCategoryImageChange}
                                                        />
                                                        {form.getValues("image") && 
                                                            <img src={form.getValues("image")} className="h-[200px] w-[200px] object-cover" loading="lazy"/>
                                                        }
                                                        <Button
                                                            type="button"
                                                            onClick={() => categoryImageFileRef.current?.click()}
                                                            className="bg-slate-300 w-1/3"   
                                                        >
                                                            {formField.placeholder}
                                                        </Button>
                                                    </>
                                                }
                                            </>
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        ))}
                        <DialogFooter>
                            <Button 
                                type="submit" 
                                className="bg-black text-white"
                                disabled={isUpdating}
                            >
                                {isUpdating ? <AiOutlineLoading3Quarters className="animate-spin"/> : `${dialog.mode === "ADD" ? "Add Category" : "Save Changes"}` }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
