import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addressSchema, profileSchema } from "@/schema";
import { useForm, UseFormReturn } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import { z } from "zod";
import AddressDialog from "./address-dialog";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { MdOutlineDelete } from "react-icons/md";
import useModalStore from "@/hooks/modal";
import { deleteAddress } from "@/store/auth-slice";
import { toast } from "sonner";
type DialogField = {
  isOpen: boolean
}
export default function AddAdressesDialog({
  dialog,
  setDialog,
  form
} : {
  dialog: DialogField,
  setDialog: React.Dispatch<React.SetStateAction<DialogField>>,
  form: UseFormReturn<z.infer<typeof profileSchema>>
}) {
  const {user} = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const { openModal, closeModal } = useModalStore();
  const [addressDialog, setAddressDialog] = useState({
    isOpen: false,
    mode: "ADD" as "ADD" | "EDIT" | "VIEW",
    editAddressIdx: -1
  })
  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      id: "",
      lat: 0,
      lng: 0,
      houseNumber: "",
      road: "",
      suburb: "",
      city: "",
      state: "",
      country: "",
      postcode: "",
    }
  })
  const handleOpenDeleteModal = (address: z.infer<typeof addressSchema>) => {
    openModal({type: "DELETE", title: "address", onSubmit: () => handleDeleteAddress(address)})
  }
  const handleDeleteAddress = (address: z.infer<typeof addressSchema>) => {
    dispatch(deleteAddress(address.id)).then((res) => {
      if(res.payload.success) {
        form.setValue("addresses", form.getValues("addresses").filter((a: z.infer<typeof addressSchema>) => a.id !== address.id))
        toast.success(res.payload.message)
        closeModal()
      }
      else {
        toast.error(res.payload.message)
      }
    })
  }
  const checkSaved = (address: z.infer<typeof addressSchema>) => {
    if(
      !user?.addresses || 
      !(user.addresses.map((a: z.infer<typeof addressSchema>) => a.lat).includes(address.lat) &&
        user.addresses.map((a: z.infer<typeof addressSchema>) => a.lng).includes(address.lng))
    ) return false
    const findAddress = user.addresses.find((a: z.infer<typeof addressSchema>) => a.lat === address.lat && a.lng === address.lng)
    if(!findAddress) return false
    if(
      findAddress?.lat !== address.lat ||
      findAddress?.lng !== address.lng ||
      findAddress?.houseNumber !== address.houseNumber ||
      findAddress?.road !== address.road ||
      findAddress?.suburb !== address.suburb ||
      findAddress?.city !== address.city ||
      findAddress?.state !== address.state ||
      findAddress?.country !== address.country ||
      findAddress?.postcode !== address.postcode
    ) return false
    return true
  }
  const handleTriggerAddDialog = () => {
    setAddressDialog({
      ...addressDialog,
      isOpen: true,
      mode: "ADD"
    })
    addressForm.reset()
  }
  const handleTriggerEditDialog = (idx: number) => {
    setAddressDialog({
      isOpen: true,
      mode: "EDIT",
      editAddressIdx: idx
    })
    addressForm.setValue("id", form.getValues("addresses")[idx].id)
    addressForm.setValue("lat", form.getValues("addresses")[idx].lat)
    addressForm.setValue("lng", form.getValues("addresses")[idx].lng)
    addressForm.setValue("houseNumber", form.getValues("addresses")[idx].houseNumber)
    addressForm.setValue("road", form.getValues("addresses")[idx].road)
    addressForm.setValue("suburb", form.getValues("addresses")[idx].suburb)
    addressForm.setValue("city", form.getValues("addresses")[idx].city)
    addressForm.setValue("state", form.getValues("addresses")[idx].state)
    addressForm.setValue("country", form.getValues("addresses")[idx].country)
    addressForm.setValue("postcode", form.getValues("addresses")[idx].postcode)
  }
  return (
    <Dialog open={dialog.isOpen} onOpenChange={() => setDialog((prev) => ({...prev, isOpen: !prev.isOpen}))}>
      <DialogContent className="bg-white overflow-auto">
        <DialogHeader>
          <DialogTitle>Addresses</DialogTitle>
          <DialogDescription>Manage your addresses</DialogDescription>
          <div 
            className="flex flex-col gap-3"
            onClick={handleTriggerAddDialog}
          >
            <Button className="self-end bg-black text-white">
              <FaPlus />
              Add Address
            </Button>
          </div>
          <AddressDialog
            dialog={addressDialog}
            setDialog={setAddressDialog}
            form={addressForm}
            profileForm={form}
          />
        </DialogHeader>
        {form.getValues("addresses").map((address: z.infer<typeof addressSchema>, idx: number) => (
          <div key={idx} className="flex flex-col gap-2">
            <p className="ml-2 font-semibold flex flex-row gap-2 items-center">
              Address {idx + 1}
              <span className="text-xs text-orange-500">{checkSaved(address) ? "Saved" : "Not Saved"}</span>
            </p>
            <div className="flex flex-row items-center gap-2">
              <div 
                className="bg-slate-100 p-2 rounded-md hover:bg-slate-200 cursor-pointer w-[90%]"
                onClick={() => handleTriggerEditDialog(idx)}
              >
                <p>{address.houseNumber ? address.houseNumber + ", " : ""} 
                  {address.road ? address.road + ", " : ""} 
                  {address.suburb ? address.suburb + ", " : ""} 
                  {address.city ? address.city + ", " : ""} 
                  {address.state ? address.state + ", " : ""}
                  {address.country ? address.country + ", " : ""}
                </p>
              </div>
              <MdOutlineDelete 
                size={30} 
                color="red" 
                className="cursor-pointer hover:animate-shake"
                onClick={() => handleOpenDeleteModal(address)}
              />
            </div>
            <Separator className="bg-slate-00 my-2 h-[1px]" />
          </div>
        ))}
      </DialogContent>
    </Dialog>
  )
}
