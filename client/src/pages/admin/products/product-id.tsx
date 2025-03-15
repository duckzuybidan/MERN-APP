import Loading from "@/components/custom/loading"
import NotFound from "@/components/not-found"
import { productSchema, productVariantSchema } from "@/schema"
import { getProductById } from "@/store/admin-slice/product"
import { AppDispatch, RootState } from "@/store/store"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
export default function Product() {
  const navigate = useNavigate()
  const [isMounted, setIsMounted] = useState(false)

  const [isError, setIsError] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<z.infer<typeof productSchema> | null>(null)
  const [chosenVariant, setChosenVariant] = useState<{
    variant: z.infer<typeof productVariantSchema> | null,
    quantity: number
  }>({
    variant: null,
    quantity: 1
  })
  const dispatch = useDispatch<AppDispatch>()
  const { isFetching, cachedFetchProducts } = useSelector((state: RootState) => state.product)
  const { categories } = useSelector((state: RootState) => state.category)
  const { productId } = useParams()
  const displayPrice = (variants: z.infer<typeof productVariantSchema>[]) => {
    const prices = variants.map((variant) => parseFloat(variant.price))
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    if (maxPrice === minPrice) {
      return "$" + maxPrice
    }
    return `$${minPrice} - $${maxPrice}`
  }
  const isOnTime = (variant: z.infer<typeof productVariantSchema>) => {
    const expiry = variant.discountExpiry ? new Date(variant.discountExpiry) : null
    return expiry && expiry > new Date() && variant.discountPrice !== ""
  }
  const handleChoseVariant = (variant: z.infer<typeof productVariantSchema>) => {
    if (chosenVariant.variant?.id === variant.id) {
      setChosenVariant({variant: null, quantity: 1})
      return
    }
    setChosenVariant({variant: variant, quantity: 1})
  }
  useEffect(() => {
    if (!productId) return
    setIsMounted(true)
    const product = cachedFetchProducts.find((product) => product.id === productId)
    if (product) {
      setCurrentProduct(product)
      return
    }
    dispatch(getProductById(productId)).then((res) => {
      if (res.meta.requestStatus === "rejected") {
        setIsError(true)
      }
    })
  }, [productId, dispatch, cachedFetchProducts])
  if (!isMounted || isFetching){
    return <Loading />
  }
  if (isError || !currentProduct) {
    return <NotFound />
  }
  return (
    <div className="w-full p-10 flex flex-col gap-10">
      <div className="w-full h-max flex flex-row">
        <div className="w-1/2 flex justify-center p-20">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full h-min aspect-square bg-slate-100 flex items-center justify-center"
        >
          <CarouselContent>
            {currentProduct.displayImages.map((image, index) => (
                <CarouselItem
                  key={index}
                >
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </CarouselItem>
              ))}
          </CarouselContent>
        </Carousel>
        </div>
        <div className="w-1/2 flex flex-col gap-5">
          <span 
            className="text-gray-700 hover:text-black hover:cursor-pointer hover:underline"
            onClick={() => navigate(`/product?category=${currentProduct.categoryId}`)}
          >
            {categories?.find((category) => category.id === currentProduct.categoryId)?.name}
          </span>
          <span className="text-3xl font-semibold break-words">{currentProduct.title}</span>
          <span className="text-2xl font-semibold">
          Price: 
          <span className="text-orange-500 ml-2">{displayPrice(currentProduct.variants)}</span>
          </span>
          <div className="flex flex-row flex-wrap gap-2">
            {currentProduct.variants.map((variant: z.infer<typeof productVariantSchema>,index: number) => (
              <div
                key={index}
                className={`w-max flex flex-col gap-1 py-2 px-5  shadow-md rounded-xl cursor-pointer  
                  ${variant.id === chosenVariant?.variant?.id ? "bg-slate-300" : "bg-slate-50"}`}
                onClick={() => handleChoseVariant(variant)}
              >
                <div className="flex flex-row gap-2 items-center">
                  <img
                    src={variant.image}
                    alt="Variant"
                    className="h-10 w-10 object-cover"
                    loading="lazy"
                  />
                  <p>{variant.name}</p>
                </div>
              </div>
            ))}
          </div>
          {chosenVariant.variant && (
            <div className="flex flex-col gap-2">
              <div className="bg-slate-100 w-[60%] aspect-square">
                <img
                  src={chosenVariant.variant.image}
                  alt="Variant"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              {isOnTime(chosenVariant.variant) && chosenVariant.variant.discountPrice ? (
                <div className="flex flex-row gap-1">
                  Price: 
                  <span className="font-semibold text-orange-500">${chosenVariant.variant.discountPrice}</span>
                  <span className="font-semibold text-slate-500 line-through">${chosenVariant.variant.price}</span>
                </div>
              ) : (
                <span className="font-semibold text-orange-500">${chosenVariant.variant.price}</span>
              )}
              <p className="font-semibold">In Stock: <span className="font-[400]">{chosenVariant.variant.inStock}</span></p>
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Description</h1>
        <div className="p-2" dangerouslySetInnerHTML={{__html: currentProduct.description}}/>
      </div>
    </div>
  )
}
