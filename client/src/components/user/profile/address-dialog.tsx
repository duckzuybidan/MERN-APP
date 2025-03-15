import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addressSchema, profileSchema } from "@/schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import "leaflet/dist/leaflet.css";
import MapSelect from "./map-select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
type DialogField = {
  isOpen: boolean;
  mode: "ADD" | "EDIT" | "VIEW";
  editAddressIdx: number;
};
type FormField = {
  name: "lat" | "lng" | "houseNumber" | "road" | "suburb" | "city" | "state" | "country" | "postcode";
  placeholder: string;
  editable: boolean;
}
const formFields: FormField[] = [
  {name: "lat", placeholder: "Latitude", editable: false},
  {name: "lng", placeholder: "Longitude", editable: false},
  {name: "houseNumber", placeholder: "House Number", editable: true},
  {name: "road", placeholder: "Road", editable: true},
  {name: "suburb", placeholder: "Suburb", editable: true},
  {name: "city", placeholder: "City", editable: true},
  {name: "state", placeholder: "State", editable: true},
  {name: "country", placeholder: "Country", editable: true},
  {name: "postcode", placeholder: "Postcode", editable: true},
]
export default function AddressDialog({
  dialog,
  setDialog,
  form,
  profileForm
}: {
  dialog: DialogField;
  setDialog: React.Dispatch<React.SetStateAction<DialogField>>;
  form: UseFormReturn<z.infer<typeof addressSchema>>;
  profileForm?: UseFormReturn<z.infer<typeof profileSchema>>
}) {
  const onSubmit = (data: z.infer<typeof addressSchema>) => {
    if(!profileForm) return
    if(dialog.mode === "EDIT") {
      profileForm.setValue("addresses", [...profileForm.getValues("addresses").slice(0, dialog.editAddressIdx), data, ...profileForm.getValues("addresses").slice(dialog.editAddressIdx + 1)])
      toast.success("Address updated successfully")
      setDialog({...dialog, isOpen: false})
      return
    }
    profileForm.setValue("addresses", [...profileForm.getValues("addresses"), data])
    toast.success("Address added successfully")
    form.reset()
    setDialog({...dialog, isOpen: false})
  }
  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={() => {
        setDialog((prev) => ({ ...prev, isOpen: !prev.isOpen }))
      }}
    >
      <DialogContent className="bg-white max-w-[90%] overflow-auto h-full">
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.stopPropagation()
              e.preventDefault()
              form.handleSubmit(onSubmit)()
            }} 
            className="flex flex-col gap-3"
          >
            <DialogHeader>
              <DialogTitle>Address</DialogTitle>
              <DialogDescription>
                {dialog.mode === "ADD" ? "Add Address" : "Edit Address"}
              </DialogDescription>
            </DialogHeader>
            <MapSelect 
              position={[form.watch("lat"), form.watch("lng")]} 
              onPositionChange={(position) => {
                if(dialog.mode === "VIEW") return
                form.setValue("lat", position[0])
                form.setValue("lng", position[1])
              }}
              onAddressChange={(address) => {
                form.setValue("houseNumber", address.houseNumber || "")
                form.setValue("road", address.road || "")
                form.setValue("suburb", address.suburb || "")
                form.setValue("city", address.city || "")
                form.setValue("state", address.state || "")
                form.setValue("country", address.country || "")
                form.setValue("postcode", address.postcode || "")
              }}
            />
            {formFields.map((formField: FormField) => (
              <FormField
                key={formField.name}
                control={form.control}
                name={formField.name}
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>{formField.placeholder}</FormLabel>
                      <FormControl>
                      <Input
                          placeholder={formField.placeholder} 
                          className="border-x-transparent border-t-transparent border-b-slate-300"
                          disabled={!formField.editable || dialog.mode === "VIEW"}
                          {...field}
                          value={field.value}
                      />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px]"/>
                  </FormItem>
                )}
              /> 
            ))}
            <DialogFooter>
              {dialog.mode !== "VIEW" && 
                <Button 
                  type="submit"
                  className="bg-black text-white"
                  >
                  {dialog.mode === "ADD" ? "Add " : "Update"}
                </Button>
              }
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
