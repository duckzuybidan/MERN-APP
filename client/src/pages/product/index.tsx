import { productSchema, productVariantSchema, ProductWithPage } from "@/schema";
import { AppDispatch, RootState } from "@/store/store";
import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import {getAllProducts, getTotalPages} from "@/store/admin-slice/product";
import Loading from "@/components/custom/loading";
import { useSearchParams } from "react-router-dom";
import CustomPagination from "@/components/custom/custom-pagination";
import { useNavigate } from "react-router-dom";
export default function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const {products, isLoading, productsPerPage, totalPages} = useSelector((state: RootState) => state.product)
  const {categories} = useSelector((state: RootState) => state.category)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentProducts, setCurrentProducts] = useState<z.infer<typeof productSchema>[]>([])
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
  useEffect(() => {
    const page = searchParams.get("page") || 1
    const query = searchParams.get("query") || ""
    const filterCategory = searchParams.get("category") || ""
    const priceOrder = searchParams.get("price_order") || "none"
    const priceMin = searchParams.get("price_min") || 1
    const priceMax = searchParams.get("price_max") || 1000000
    const updateAtOrder = searchParams.get("updateAt_order") || "none"
    setCurrentPage(Number(page))
    const fetchProducts = async () => {
      const findPage = products?.find((product) => 
        product.page === Number(page) && 
        product.query === query &&
        product.filterCategory === filterCategory &&
        product.priceOrder === priceOrder &&
        product.priceMin === Number(priceMin) &&
        product.priceMax === Number(priceMax) &&
        product.updatedAtOrder === updateAtOrder
      )
      if(findPage) {
        setCurrentProducts(findPage.products)
        return
      }
      await dispatch(getAllProducts({
        page: Number(page),
        limit: productsPerPage,
        query: query, 
        category: filterCategory,
        priceOrder: priceOrder as ProductWithPage["priceOrder"],
        priceMin: Number(priceMin),
        priceMax: Number(priceMax),
        updateAtOrder: updateAtOrder as ProductWithPage["updatedAtOrder"]
      }))
      await dispatch(getTotalPages(productsPerPage))
    }
    fetchProducts()
  }, [
      dispatch, 
      products, 
      searchParams.get("page"), 
      searchParams.get("query"), 
      searchParams.get("category"), 
      searchParams.get("price_order"), 
      searchParams.get("price_min"), 
      searchParams.get("price_max"), 
      searchParams.get("updateAt_order")
    ])
  if(isLoading) {
    return <Loading/>
  }
  return (
    <div className="w-full p-10 flex flex-col gap-10">
      <div className="grid grid-cols-4 gap-4">
        {currentProducts.length === 0 && <p className="col-span-4 text-center">No products found.</p>}
        {currentProducts.map((product: z.infer<typeof productSchema>, index: number) => (
          <div 
            key={index} 
            onClick={() => navigate(`/product/${product.id}`)}
            className="relative w-full flex flex-col items-center gap-2 p-2 bg-slate-100 shadow rounded-xl cursor-pointer hover:border-2 border-orange-300"
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
        ))}
      </div>
      <CustomPagination currentPage={currentPage} totalPages={totalPages}/>
    </div>
  )
}
