import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import useModalStore from "@/hooks/modal"
import { productSchema, productVariantSchema } from "@/schema"
import { useRef} from "react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
type DialogFeild = {
  isOpen: boolean,
  mode: "ADD" | "EDIT",
  editVariantIdx: number
}

type VariantFormField = {
  name: "name" | "price" | "image" | "inStock" | "discountPrice" | "discountExpiry",
  placeholder: string,
  type: "INPUT-NUMBER" | "INPUT-TEXT" | "FILE" | "INPUT-DATE"
}
const formFields : VariantFormField[] = [
  {name: "image", placeholder: "Choose Image", type: "FILE"},
  {name: "name", placeholder: "Name", type: "INPUT-TEXT"},
  {name: "price", placeholder: "Price(USD)", type: "INPUT-NUMBER"},
  {name: "inStock", placeholder: "In Stock", type: "INPUT-NUMBER"},
  {name: "discountPrice", placeholder: "Discount Price(USD)", type: "INPUT-NUMBER"},
  {name: "discountExpiry", placeholder: "Discount Expiry", type: "INPUT-DATE"},
]
export default function ProductVariantDialog(
  {
    form,
    productForm,
    dialog,
    setDialog
  }: {
    form: UseFormReturn<z.infer<typeof productVariantSchema>>,
    productForm: UseFormReturn<z.infer<typeof productSchema> & {variants: z.infer<typeof productVariantSchema>[] | any}>,
    dialog: DialogFeild,
    setDialog: React.Dispatch<React.SetStateAction<DialogFeild>>
  }
) {
  const variantImageFileRef = useRef<HTMLInputElement>(null)
  const { openModal, closeModal } = useModalStore();
  const handleOpenDeleteModal = (e: React.MouseEvent<HTMLButtonElement>, title: string) => {
    e.preventDefault()
    openModal({type: "DELETE", title: title, onSubmit: handleDeleteVariant})
  };
  const handleVariantImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      if(e.target?.result) {
        form.setValue("image", e.target.result as string)
      }}
    reader.readAsDataURL(file)
  }
  const handleDeleteVariant = () => {
    productForm.setValue("variants", [...productForm.getValues("variants").slice(0, dialog.editVariantIdx), ...productForm.getValues("variants").slice(dialog.editVariantIdx + 1)])
    setDialog({...dialog, isOpen: false})
    closeModal()
    toast.success("Variant deleted successfully")
  }
  const onSubmit = (data: z.infer<typeof productVariantSchema>) => {
    const checkNames = productForm.getValues("variants").map((variant: z.infer<typeof productVariantSchema>) => variant.name)
    if(checkNames.includes(data.name) && data.name !== productForm.getValues("variants")[dialog.editVariantIdx]?.name) {
      toast.error("Variant name already exists")
      return
    }
    if(dialog.mode === "EDIT") {
      productForm.setValue("variants", [...productForm.getValues("variants").slice(0, dialog.editVariantIdx), data, ...productForm.getValues("variants").slice(dialog.editVariantIdx + 1)])
      toast.success("Variant updated successfully")
      setDialog({...dialog, isOpen: false, editVariantIdx: -1})
      return
    }
    productForm.setValue("variants", [...productForm.getValues("variants"), data])
    setDialog({...dialog, isOpen: false})
    toast.success("Variant added successfully")
    form.reset()
  }
  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) =>
        setDialog((prev) => ({
          ...prev,
          isOpen: open,
        }))
      }
    >
      <DialogContent className="bg-white overflow-auto h-[80%]">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              e.preventDefault();
              form.handleSubmit(onSubmit)();
            }}
            className="space-y-8"
          >
            <DialogHeader>
              <DialogTitle>
                {dialog.mode === "ADD" ? "Add Variant" : "Edit Variant"}                                           
              </DialogTitle>
              <DialogDescription>
                {dialog.mode === "ADD" ? "Add variant for this product" : "Edit variant for this product"}
              </DialogDescription>
            </DialogHeader>
            {formFields.map((formField, index) => (                                  
                <FormField
                  key={index}
                  control={form.control}
                  name={formField.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {formField.placeholder.toUpperCase()}
                      </FormLabel>
                      <FormControl>
                        <>
                          {formField.type === "INPUT-TEXT" && (                                                     
                            <Input
                              placeholder={formField.placeholder}
                              className="p-2 border-2 border-slate-300 focus:border-none"
                              type="text"
                              {...field}
                              value={field.value || ""}
                            />
                          )}
                          {formField.type === "INPUT-NUMBER" && field.value !== null && (
                            <Input
                              placeholder={formField.placeholder}
                              className="p-2 border-2 border-slate-300 focus:border-none"
                              type="number"
                              {...field}
                              value={field.value}
                            />
                          )}
                          {formField.type === "FILE" && (                                                     
                            <div className="flex flex-col gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={variantImageFileRef}
                                onChange={handleVariantImageChange}
                              />
                              {form.getValues("image") && (
                                <img
                                  src={form.getValues("image")}
                                  className="h-[200px] w-[200px] object-cover"
                                  loading="lazy"
                                />
                              )}
                              <Button
                                type="button"
                                onClick={() => variantImageFileRef.current?.click()}
                                className="bg-slate-300 w-1/3"
                              >
                                {formField.placeholder}
                              </Button>
                            </div>
                          )}
                          {formField.type === "INPUT-DATE" && (
                            <Input
                              placeholder={formField.placeholder}
                              className="p-2 border-2 border-slate-300 focus:border-none"
                              type="date"
                              {...field}
                              value={field.value || ""}
                            />
                          )}
                        </>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              )
            )}
            <DialogFooter>
              {dialog.mode === "EDIT" && (
                <Button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    handleOpenDeleteModal(e, form.getValues("name"))
                  }
                  className="bg-red-500 text-white"
                >
                  Delete
                </Button>
              )}
              <Button
                className="bg-black text-white"
                type="submit"
              >
                {dialog.mode === "ADD" ? "Add Variant": "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
