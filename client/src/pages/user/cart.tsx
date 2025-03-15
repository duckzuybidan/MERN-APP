import Loading from "@/components/custom/loading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CartItemSchema, CartSchema } from "@/schema"
import { AppDispatch, RootState } from "@/store/store"
import { deleteCartItem, getCartByUserId } from "@/store/user-slice"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { z } from "zod"
import { FaCheck, FaXmark } from "react-icons/fa6";
import { FaShippingFast } from "react-icons/fa";
import CartInfoDialog from "@/components/product/cart-info-dialog"
import { Link, useNavigate } from "react-router-dom"
import { MdOutlineDelete } from "react-icons/md"
import useModalStore from "@/hooks/modal"
import { toast } from "sonner"
const tableHeaders = ["Product", "Total Price", "Quantity", "Order Date", "Status", "Delivery Info"] 
export default function Cart() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const {user} = useSelector((state: RootState) => state.auth)
  const [currentCart , setCurrentCart] = useState<z.infer<typeof CartSchema> | null> (null)
  const {cart, isCartLoading} = useSelector((state: RootState) => state.user)
  const [cartInfoDialog, setCartInfoDialog] = useState({
    isOpen: false,
    mode: "ADD" as "ADD" | "EDIT",
  })
  const { openModal, closeModal } = useModalStore();
  const handleTriggerEditDialog = () => {
    setCartInfoDialog({
      isOpen: true,
      mode: "EDIT"
    })
  }
  useEffect(() => {
    if(!user?.id) return
    if(cart){
      setCurrentCart(cart)
      return
    }
    dispatch(getCartByUserId(user.id))
  }, [dispatch, user?.id, cart])
  const handleOpenDeleteModal = (item: z.infer<typeof CartItemSchema>) => {
    openModal({type: "DELETE", title: "cart item", onSubmit: () => handleDeleteCartItem(item)})
  }
  const handleDeleteCartItem = (item: z.infer<typeof CartItemSchema>) => {
    dispatch(deleteCartItem(item.id)).then((res) => {
      if(res.payload.success) {
        closeModal()
        toast.success(res.payload.message)
      } else {
        toast.error(res.payload.message)
      }
    })
  }
  if (isCartLoading) {
    return <Loading />
  }
  return (
    <div className="w-full h-full flex flex-col gap-5 p-5">
      <h1 className="text-3xl font-semibold">Your Cart</h1>
      {currentCart && currentCart.cartItems.length === 0 && (
        <div className="flex flex-col gap-2 items-center">
          <p className="text-2xl font-semibold">Your cart is empty</p>
          <Link to="/product" className="text-sky-500 hover:underline">Add products to your cart to checkout</Link>
        </div>
      )}
      {currentCart && currentCart.cartItems.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableHead className="w-1/6" key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCart.cartItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div 
                    className="flex flex-row gap-2 items-center bg-slate-100 p-2 rounded-md w-max hover:bg-slate-200 cursor-pointer"
                    onClick={() => navigate(`/product/${item.item.productId}`)}
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
                <TableCell className="font-bold">
                  {item.status === "VERIFIED" && (
                    <div className="flex flex-row gap-1 items-center">
                      <p>Verified</p>
                      <FaCheck size={25} color="green"/>
                    </div>
                  )}
                  {item.status === "UNVERIFIED" && (
                    <div className="flex flex-row gap-1 items-center">
                      <p>Unverified</p>
                      <FaXmark size={25} color="red"/>
                    </div>
                  )}
                  {item.status === "SHIPPED" && (
                    <div className="flex flex-row gap-1 items-center">
                      <p>Shipped</p>
                      <FaShippingFast size={25} color="blue"/>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span 
                    className="text-sky-500 hover:underline cursor-pointer"
                    onClick={handleTriggerEditDialog}
                  >
                    Delivery Info
                    </span>
                  <CartInfoDialog 
                    dialog={cartInfoDialog} 
                    setDialog={setCartInfoDialog} 
                    variant={item.item}
                    quantity={Number(item.quantity)}
                    defaultPhone={item.phone}
                    defaultAddressId={item.addressId}
                    cartItem={item}
                    defaultPaymentMethod={item.paymentMethod}
                  />
                </TableCell>
                <TableCell>
                  <MdOutlineDelete 
                    size={30} 
                    color="red" 
                    className="cursor-pointer hover:animate-shake"
                    onClick={() => handleOpenDeleteModal(item)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
