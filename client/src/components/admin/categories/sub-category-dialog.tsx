import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { categorySchema } from "@/schema";
import { createCategory, updateCategory } from "@/store/admin-slice/category";
import { AppDispatch, RootState } from "@/store/store";
import { UseFormReturn } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
type DialogFeild = {
    mode: "ADD" | "EDIT"
    isOpen: boolean
}
type SubCategoryFormField = {
  name: "name"
  placeholder?: string
  type?: "INPUT"
}
const subCategoryFormFields: SubCategoryFormField[] = [
  {name: "name", placeholder: "Name", type: "INPUT"},
]
export default function SubCategoryDialog({
    dialog,
    setDialog,
    title,
    form
}: {
    dialog: DialogFeild,
    setDialog: React.Dispatch<React.SetStateAction<DialogFeild>>,
    title: string | undefined,
    form: UseFormReturn<z.infer<typeof categorySchema>>,
}) {
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
          form.reset()
          setDialog({...dialog, isOpen: false})
        }
        else {
          toast.error(res.payload.message)
        }
      })
    }
    return (
      <Dialog open={dialog.isOpen} onOpenChange={(open) => setDialog((prev) => ({...prev, isOpen: open}))}>
          <DialogContent className="bg-white">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <DialogHeader>
                <DialogTitle>{dialog.mode === "ADD" ? "Add Sub Category" : "Edit Sub Category"}</DialogTitle>
                <DialogDescription>{dialog.mode === "ADD" ? "Add a new sub category for " + title : "Edit " + title + " sub category"}</DialogDescription>
              </DialogHeader>
                {subCategoryFormFields.map((formField: SubCategoryFormField) => (
                  <FormField
                    key={formField.name}
                    control={form.control}
                    name={formField.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{formField.placeholder}</FormLabel>
                        <FormControl>
                          {formField.type === "INPUT" && 
                            <Input
                                placeholder={formField.placeholder}
                                className="p-2 border-2 border-slate-300 focus:border-none"
                                {...field}
                            />
                          }
                        </FormControl>
                        <FormMessage className="text-red-500 text-[10px]"/>
                      </FormItem>
                    )}
                  />
                ))}
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="bg-black text-white"
                    onClick={() => onSubmit(form.getValues())}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Submit"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
    )
}
