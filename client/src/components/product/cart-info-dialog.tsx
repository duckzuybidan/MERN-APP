import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React, { useEffect, useState } from "react"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CartItemSchema, productVariantSchema } from "@/schema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { toast } from "sonner";
import { addToCart, updateCartItemInfo } from "@/store/user-slice";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { CiWarning } from "react-icons/ci";
type DialogFields = {
  isOpen: boolean,
  mode: "ADD" | "EDIT"
}
const paymentMethods: z.infer<typeof CartItemSchema>["paymentMethod"][] = [
  "CASH_ON_DELIVERY",
]
export default function CartInfoDialog({
  dialog,
  setDialog,
  variant,
  quantity,
  defaultAddressId,
  defaultPhone,
  defaultPaymentMethod,
  cartItem,
  onReset
}: {
  dialog: DialogFields,
  setDialog: React.Dispatch<React.SetStateAction<DialogFields>>
  variant: z.infer<typeof productVariantSchema>
  quantity: number
  defaultAddressId?: string
  defaultPhone?: string
  defaultPaymentMethod?: z.infer<typeof CartItemSchema>["paymentMethod"]
  cartItem?: z.infer<typeof CartItemSchema>
  onReset?: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const {isCartUpdating} = useSelector((state: RootState) => state.user)
  const [data, setData] = useState({
    phone: defaultPhone || user?.phone,
    addressId: undefined as string | undefined,
    paymentMethod: "CASH_ON_DELIVERY" as z.infer<typeof CartItemSchema>["paymentMethod"]
  })
  const isOnTime = (variant: z.infer<typeof productVariantSchema>) => {
    const expiry = variant.discountExpiry ? new Date(variant.discountExpiry) : null
    return expiry && expiry > new Date() && variant.discountPrice !== ""
  }
  const computePrice = () => {
    if (isOnTime(variant) && variant.discountPrice) {
      return Number(variant.discountPrice) * quantity
    }
    return Number(variant.price) * quantity
  }
  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please sign in to add to cart")
      return
    }
    if(!data.phone || !data.addressId){
      toast.error("Phone and address is required")
      return
    }
    dispatch(addToCart({
      userId: user.id,
      itemId: variant.id,
      quantity: quantity.toString(),
      phone: data.phone,
      addressId: data.addressId,
      price: computePrice().toString(),
      paymentMethod: data.paymentMethod
    })).then((res) => {
      if (res.payload.success) {
        toast.success(res.payload.message)
        onReset && onReset()
        setDialog((prev) => ({...prev, isOpen: false}))
      } else {
        toast.error(res.payload.message)
      }
    })
  }
  const handleUpdateCartItemInfo = () => {
    if(!cartItem) return
    if(!data.phone || !data.addressId){
      toast.error("Phone and address is required")
      return
    }
    dispatch(updateCartItemInfo({
      cartItemId: cartItem.id,
      phone: data.phone,
      addressId: data.addressId,
      paymentMethod: data.paymentMethod
    })).then((res) => {
      if (res.payload.success) {
        toast.success(res.payload.message)
        onReset && onReset()
        setDialog((prev) => ({...prev, isOpen: false}))
      } else {
        toast.error(res.payload.message)
      }
    })
  }
  useEffect(() => {
    if(dialog.mode === "EDIT"){
      setData((prev) => ({
        ...prev, 
        phone: defaultPhone, 
        addressId: defaultAddressId,
        paymentMethod: defaultPaymentMethod ? defaultPaymentMethod : "CASH_ON_DELIVERY"
      }))
    }
    if(dialog.mode === "ADD"){
      setData((prev) => ({...prev, phone: user?.phone}))
    }
  }, [user?.phone, dialog.mode])
  return (
    <Dialog open={dialog.isOpen} onOpenChange={() => setDialog((prev) => ({...prev, isOpen: !prev.isOpen}))}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Cart Info</DialogTitle>
          <DialogDescription>Your phone and address for delivery</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-2 items-center bg-slate-200 p-2 rounded-md w-max">
            <img
              src={variant.image}
              alt="Variant"
              className="h-10 w-10 object-cover"
              loading="lazy"
            />
            <p>{variant.name}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Total Price</Label>
            <p className="font-semibold text-orange-500">${computePrice()}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Label>Phone</Label>
              <Link 
                className="text-xs text-sky-500 hover:underline cursor-pointer"
                to="/user/profile"
              >
                Update here!
              </Link>
            </div>
            {user && user.phone !== data.phone && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <CiWarning className="text-yellow-600" />
                  <span className="text-xs">Delivery phone number is different from your current phone number.</span>
                </div>
                <span 
                  className="text-sky-500 text-xs cursor-pointer hover:underline"
                  onClick={() => setData((prev) => ({...prev, phone: user.phone}))}
                >
                  Click here to update your phone number!
                </span>
              </div>
            )}
            <Input 
              disabled={true}
              value={data.phone}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Label>Address</Label>
              <Link 
                className="text-xs text-sky-500 hover:underline cursor-pointer"
                to="/user/profile"
              >
                Update here!
              </Link>
            </div>
            <Select
              value={data.addressId}
              onValueChange={(value) => setData((prev) => ({...prev, addressId: value}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select address"/>
              </SelectTrigger>
              <SelectContent className="bg-slate-100">
                <SelectGroup>
                  {user?.addresses?.map((address) => (
                    <SelectItem key={address.id} value={address.id} className="cursor-pointer hover:bg-slate-200">
                      {address.houseNumber ? address.houseNumber + ", " : ""} 
                      {address.road ? address.road + ", " : ""} 
                      {address.suburb ? address.suburb + ", " : ""} 
                      {address.city ? address.city + ", " : ""} 
                      {address.state ? address.state + ", " : ""}
                      {address.country ? address.country + ", " : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Payment Method</Label>
            <Select
              value={data.paymentMethod}
              onValueChange={(value: z.infer<typeof CartItemSchema>["paymentMethod"]) => setData((prev) => ({...prev, paymentMethod: value}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select address"/>
              </SelectTrigger>
              <SelectContent className="bg-slate-100">
                <SelectGroup>
                  {paymentMethods.map((method: z.infer<typeof CartItemSchema>["paymentMethod"], index: number) => (
                    <SelectItem key={index} value={method} className="cursor-pointer hover:bg-slate-200">
                      {method.split("_").join(" ")}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
        </div>
        <DialogFooter>
          <Button 
            onClick={() => {
              if (dialog.mode === "ADD") {
                handleAddToCart()
              } else {
                handleUpdateCartItemInfo()
              }
            }}
            className="bg-black text-white"
            disabled={isCartUpdating}
          >
            {isCartUpdating ? <AiOutlineLoading3Quarters className="animate-spin"/> : `${dialog.mode === "ADD" ? "Add to cart" : "Update cart"}` }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
