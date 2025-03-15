import { eventSchema, productSchema, productVariantSchema } from "@/schema";
import { z } from "zod";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import Loading from "../custom/loading";


export default function Events() {
  const navigate = useNavigate()
  const {events, isLoading} = useSelector((state: RootState) => state.event)
  const {categories} = useSelector((state: RootState) => state.category)
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
  if (isLoading) {
    return <Loading />
  }
  return (
    <div className="w-full flex flex-col gap-10 p-10">
      {events?.map((event: z.infer<typeof eventSchema>) => (
        (event.products.length > 0 && (
          <div key={event.id} className="flex flex-col gap-3">
            <div className="flex flex-row items-center gap-3">
              <h1 className="text-2xl font-semibold">{event.title}</h1>
            </div>
            <div>
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
                      onClick={() => navigate(`/product/${product.id}`)}
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
            </div>
          </div>
        ))
      ))}
    </div>
  )
}
