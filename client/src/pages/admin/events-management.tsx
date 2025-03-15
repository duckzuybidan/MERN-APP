import EventDialog from "@/components/admin/event-management/event-dialog";
import CustomDropdownMenu from "@/components/custom/custom-dropdown-menu";
import Loading from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { eventSchema, productSchema, productVariantSchema } from "@/schema";
import { RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaRegEdit } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { z } from "zod";


export default function EventsManagement() {
  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      id: "",
      title: "",
      description: "",  
      isActive: true,
      productIds: [] as string[],
      products: [] as z.infer<typeof productSchema>[],
      expiresAt: new Date().toISOString(),
      createdAt: "",
      updatedAt: "",
    }
  })
  const navigate = useNavigate()
  const {events, isLoading} = useSelector((state: RootState) => state.event)
  const {categories} = useSelector((state: RootState) => state.category)
  const [dialog, setDialog] = useState({
    isOpen: false,
    mode: "ADD" as "ADD" | "EDIT",
  })
  const isDiscount = (product: z.infer<typeof productSchema>) => {
      const findDiscountVariant = product.variants.find((variant) => {
        const expiry = variant.discountExpiry ? new Date(variant.discountExpiry) : null
        return expiry && expiry > new Date() && variant.discountPrice !== ""
      })
      return !!findDiscountVariant
    }
    const displayPrice = (variants: z.infer<typeof productVariantSchema>[]) => {
      const prices = variants.map((variant) => parseFloat(variant.price))
      const maxPrice = Math.max(...prices)
      const minPrice = Math.min(...prices)
      if (maxPrice === minPrice) {
        return "$" + maxPrice
      }
      return `$${minPrice} - $${maxPrice}`
    }
  const handleTriggerAddDialog = () => {
    setDialog({mode: "ADD", isOpen: true})
  } 
  const handleTriggerEditDialog = (e: React.MouseEvent<HTMLButtonElement>, event : z.infer<typeof eventSchema>) => {
    e.stopPropagation()
    setDialog({mode: "EDIT", isOpen: true})
    form.setValue('id', event.id)
    form.setValue('title', event.title)
    form.setValue('description', event.description)
    form.setValue('isActive', event.isActive)
    form.setValue('productIds', event.productIds)
    form.setValue('expiresAt', event.expiresAt)
    form.setValue('createdAt', event.createdAt)
    form.setValue('updatedAt', event.updatedAt)
    form.setValue('products', event.products)
  }
  if (isLoading) {
    return <Loading />
  }
  return (
    <div className="w-full p-10 flex flex-col gap-10">
      <div className="flex flex-row items-center gap-3">
        <h1 className="text-3xl font-semibold">Events Management</h1>
          <CustomDropdownMenu>
            <Button 
              className="bg-slate-100 hover:bg-slate-200 font-semibold rounded-md"
              onClick={handleTriggerAddDialog}
            >
              Add Event
            </Button>
          </CustomDropdownMenu>
      </div>
      <EventDialog 
        dialog={dialog} 
        setDialog={setDialog} 
        form={form}
      />
      {events?.map((event: z.infer<typeof eventSchema>) => (
        <div key={event.id} className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-3">
            <h1 className="text-2xl font-semibold">{event.title}</h1>
            <Button 
              className="cursor-pointer p-0" 
              onClick={(e) => handleTriggerEditDialog(e, event)}
            >
              <FaRegEdit/>
            </Button>
          </div>
          <div>
            {!event.products.length && (
              <div className="bg-orange-100 w-full flex flex-row items-center justify-center p-5 rounded-md">
                <p className="text-[12px] font-semibold">No products available</p>
              </div>
            )}
            {event.products.length > 0 && 
              <Carousel 
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="bg-orange-100 p-2 rounded-xl w-full"
              >
                <CarouselContent className="w-full flex flex-row gap-3">
                  {event.products.map((product: z.infer<typeof productSchema>) => (
                    <CarouselItem key={product.id} className="max-w-[25%]">
                      <div  
                        className="w-full flex flex-col items-center gap-2 p-2 bg-slate-100 shadow rounded-xl cursor-pointer hover:border-2 border-orange-300"
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                      >
                        <img src={product.displayImages[0]} className="h-[150px] w-[150px] object-contain rounded-sm" loading="lazy"/>
                        <div className="w-full ml-5">
                          <p className="font-bold text-wrap">{product.title.length > 60 ? product.title.slice(0, 60) + "..." : product.title}</p>
                          <div className="flex flex-row gap-3">
                          <p className="font-semibold text-orange-500">{displayPrice(product.variants)}</p>
                            {isDiscount(product) && 
                              <div className="bg-red-100 text-red-500 rounded-md p-1">
                                <p className="text-[12px]">On sale!</p>
                              </div>}
                          </div>
                          <p className="text-[10px]">{categories?.find((category) => category.id === product.categoryId)?.name}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            }
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-semibold">Expires at: {new Date(event.expiresAt).toLocaleDateString()}</p>
            <p className="text-[12px] font-semibold">Is Active: {event.isActive ? "Yes" : "No"}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
