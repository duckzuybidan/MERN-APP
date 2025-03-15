import Loading from "@/components/custom/loading"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AddressDialog from "@/components/user/profile/address-dialog"
import useModalStore from "@/hooks/modal"
import { addressSchema, CartItemSchema } from "@/schema"
import { deleteOrder, verifyOrder } from "@/store/admin-slice/order"
import { AppDispatch, RootState } from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FaCheck } from "react-icons/fa6"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
const tableHeaders = ["Product", "Total Price", "Quantity", "Order Date", "Delivery Info"] 
export default function Orders() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { openModal, closeModal } = useModalStore();
  const {orders, isLoading} = useSelector((state: RootState) => state.order)
  const [addressDialog, setAddressDialog] = useState({
      isOpen: false,
      mode: "VIEW" as "ADD" | "EDIT" | "VIEW",
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
  const handleOpenVerifyModal = (type: "verify" | "reject", orderId: string) => {
    if(type === "verify"){
      openModal({type: "VERIFY", title: "Verify order", onSubmit: () => handleVerifyOrder(orderId)})
    }
    if(type === "reject"){
      openModal({type: "VERIFY", title: "Reject order", onSubmit: () => handleRejectOrder(orderId)})
    }
  }
  const handleVerifyOrder = (orderId: string) => {
    dispatch(verifyOrder(orderId)).then((res) => {
      if(res.payload.success) {
          toast.success(res.payload.message)
          closeModal()
      }
      else {
          toast.error(res.payload.message)
      }
    })
  }
  const handleRejectOrder = (orderId: string) => {
    dispatch(deleteOrder(orderId)).then((res) => {
      if(res.payload.success) {
          toast.success(res.payload.message)
          closeModal()
      }
      else {
          toast.error(res.payload.message)
      }
    })
  }
  if(isLoading) {
    return (
      <Loading />
    )
  }
  const handleOpenAddressDialog = (item: z.infer<typeof CartItemSchema>) => {
    setAddressDialog({
      ...addressDialog,
      isOpen: true,
      mode: "VIEW"
    })
    addressForm.setValue("id", item.address.id)
    addressForm.setValue("lat", item.address.lat)
    addressForm.setValue("lng", item.address.lng)
    addressForm.setValue("houseNumber", item.address.houseNumber)
    addressForm.setValue("road", item.address.road)
    addressForm.setValue("suburb", item.address.suburb)
    addressForm.setValue("city", item.address.city)
    addressForm.setValue("state", item.address.state)
    addressForm.setValue("country", item.address.country)
    addressForm.setValue("postcode", item.address.postcode)
  }
  return (
    <div className="w-full p-10 flex flex-col gap-10">
      <div className="flex flex-col items-center gap-3 h-full overflow-auto">
        <h1 className="text-3xl font-semibold">Orders</h1>
        {orders && orders.length === 0 && (
        <div className="flex flex-col gap-2 items-center">
          <p className="text-2xl font-semibold">No orders</p>
        </div>
        )}
        {orders && orders.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableHead className="w-1/6" key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div 
                      className="flex flex-row gap-2 items-center bg-slate-100 p-2 rounded-md w-max hover:bg-slate-200 cursor-pointer"
                      onClick={() => navigate(`/admin/products/${item.item.productId}`)}
                    >
                      <img
                        src={item.item.image}
                        alt="Variant"
                        className="h-10 w-10 object-cover"
                        loading="lazy"
                      />
                      <p>{item.item.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-orange-500">${item.price}</TableCell>
                  <TableCell className="font-semibold">{item.quantity}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="flex flex-col gap-2">
                    <div>
                      <span className="font-semibold">Phone:</span> {item.phone}
                    </div>
                    <div 
                      className="font-semibold text-sky-500 hover:underline cursor-pointer"
                      onClick={() => handleOpenAddressDialog(item)}
                    >
                      View Address 
                    </div> 
                    <AddressDialog
                      dialog={addressDialog}
                      setDialog={setAddressDialog}
                      form={addressForm}
                    />
                  </TableCell>
                  <TableCell>
                    {item.status === "UNVERIFIED" && 
                      <div className="flex flex-row gap-2">
                        <Button 
                          onClick={() => handleOpenVerifyModal("verify", item.id)}
                          className="bg-green-500"
                        >
                          Verify
                          </Button>
                        <Button 
                          className="bg-red-500"
                          onClick={() => handleOpenVerifyModal("reject", item.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    }
                    {item.status === "VERIFIED" && (
                      <div className="flex flex-row gap-1 items-center">
                        <p>Verified</p>
                        <FaCheck size={25} color="green"/>
                      </div>
                    )}
                  </TableCell>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
