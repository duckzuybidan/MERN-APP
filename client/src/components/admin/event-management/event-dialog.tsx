import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { eventSchema } from "@/schema";
import { AppDispatch, RootState } from "@/store/store";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import ProductSelect from "./product-select";
import { toast } from "sonner";
import { createEvent, deleteEvent, updateEvent } from "@/store/admin-slice/event";
import useModalStore from "@/hooks/modal";
import { editEventForProduct, removeEventForProduct } from "@/store/admin-slice/product";
type DialogFeild = {
    isOpen: boolean,
    mode: "ADD" | "EDIT"
}
type EventFormField = {
    name: "title" | "description" | "expiresAt" | "isActive" | "productIds"
    placeholder: string
    type: "INPUT" | "TEXTAREA" | "DATE" | "CHECKBOX" | "DIALOG"
}
const eventFormFields : EventFormField[] = [
  {name: "title", placeholder: "Title", type: "INPUT"},
  {name: "description", placeholder: "Description", type: "TEXTAREA"},
  {name: "expiresAt", placeholder: "Expires At", type: "DATE"},
  {name: "isActive", placeholder: "Is Active", type: "CHECKBOX"},
  {name: "productIds", placeholder: "Products", type: "DIALOG"}
]
export default function EventDialog({
    dialog,
    setDialog,
    form,
}: {
    dialog: DialogFeild,
    setDialog: React.Dispatch<React.SetStateAction<DialogFeild>>,
    form: UseFormReturn<z.infer<typeof eventSchema>>
}) {
  const { isUpdating } = useSelector(
    (state: RootState) => state.event
  )
  const { openModal, closeModal } = useModalStore();
  const dispatch = useDispatch<AppDispatch>();
  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    data.updatedAt = new Date().toISOString()
    if(dialog.mode === "EDIT") {
      dispatch(updateEvent(data)).then((res) => {
        if(res.payload.success) {
          toast.success(res.payload.message)
          setDialog({...dialog, isOpen: false})
          dispatch(editEventForProduct(res.payload.event))
          form.reset()
        } else {
          toast.error(res.payload.message)
        }
      })
      return
    }
    data.createdAt = new Date().toISOString()
    dispatch(createEvent(data)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
        setDialog({...dialog, isOpen: false})
        dispatch(editEventForProduct(res.payload.event))
        form.reset()
      }
      else {
        toast.error(res.payload.message)
      }
    })
  }
  const [productsDialog, setProductsDialog] = useState({
    isOpen: false,
  })
  const handleOpenDeleteModal = (event: z.infer<typeof eventSchema>) => {
    openModal({type: "DELETE", title: "event", onSubmit: () => handleDeleteEvent(event)})
  }
  const handleDeleteEvent = (event: z.infer<typeof eventSchema>) => {
    dispatch(deleteEvent(event.id)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
        setDialog({...dialog, isOpen: false})
        dispatch(removeEventForProduct(res.payload.event))
        closeModal()
      } else {
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
              <DialogTitle>{dialog.mode === "ADD" ? "Add Event" : "Edit Event"}</DialogTitle>
              <DialogDescription>{dialog.mode === "ADD" ? "Add a new event" : "Edit event"}</DialogDescription>
            </DialogHeader>
            {eventFormFields.map((formField: EventFormField) => (
              <FormField
                key={formField.name}
                control={form.control}
                name={formField.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formField.placeholder}</FormLabel>
                    <FormControl>
                    <>
                    {formField.type === "INPUT" &&  typeof field.value === "string" && (
                      <Input
                        placeholder={formField.placeholder}
                        className="p-2 border-2 border-slate-300 focus:border-none"
                        {...field}
                        value={field.value}
                      />
                    )}
                    {formField.type === "TEXTAREA" && typeof field.value === "string" && (
                      <Textarea
                        placeholder={formField.placeholder}
                        className="p-2 border-2 border-slate-300 focus:border-none"
                        {...field}
                        value={field.value}
                      />
                    )}
                    {formField.type === "DATE" && typeof field.value === "string" && (
                      <Input
                        type="date"
                        placeholder={formField.placeholder}
                        className="p-2 border-2 border-slate-300 focus:border-none"
                        {...field}
                        value={new Date(field.value).toISOString().split("T")[0]}
                      />
                    )}
                    {formField.type === "CHECKBOX" && typeof field.value === "boolean" && (
                      <Input
                        type="checkbox"
                        placeholder={formField.placeholder}
                        className="w-4 h-4"
                        {...field}
                        value={field.value.toString()}
                        checked={field.value}
                      />
                    )}
                    {formField.type === "DIALOG" && formField.name === "productIds" && (
                      <div className="flex flex-row items-center gap-2">
                        <span 
                          className="text-[16px] text-sky-500 hover:underline hover:cursor-pointer"
                          onClick={() => setProductsDialog({...productsDialog, isOpen: true})}
                        >
                          Browse Products
                        </span>
                        <ProductSelect 
                          dialog={productsDialog}
                          setDialog={setProductsDialog}
                          form={form}
                        />
                      </div>
                    )}
                    </>
                    </FormControl>
                    <FormMessage className="text-red-500 text-[10px]"/>
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter>
            {dialog.mode === "EDIT" && (
                <Button
                  type="button"
                  className="bg-red-500"
                  onClick={() => handleOpenDeleteModal(form.getValues())}
                >
                  Delete Event
                </Button>
              )}
              <Button
                type="submit"
                className="bg-black text-white"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  `${dialog.mode === "ADD" ? "Add Product" : "Save Changes"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
