import CustomPagination from "@/components/custom/custom-pagination";
import ProductSearchbar from "@/components/custom/product-searchbar";
import Loading from "@/components/custom/loading";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { eventSchema, productSchema, productVariantSchema, ProductWithPage } from "@/schema";
import { getAllProducts, getTotalPages } from "@/store/admin-slice/product";
import { AppDispatch, RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import SelectedProductDialog from "./selected-product-dialog";
type DialogFeild = { 
  isOpen: boolean
};
export default function ProductSelect({
  dialog,
  setDialog,
  form,
}: {
  dialog: DialogFeild,
  setDialog: React.Dispatch<React.SetStateAction<DialogFeild>>,
  form: UseFormReturn<z.infer<typeof eventSchema>>
}) {
  const [currentProducts, setCurrentProducts] = useState<z.infer<typeof productSchema>[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const {products, isLoading, productsPerPage, totalPages} = useSelector((state: RootState) => state.product)
  const {categories} = useSelector((state: RootState) => state.category)
  const [selectedProductsDialog, setSelectedProductsDialog] = useState({
    isOpen: false
  })
  const [selectedProducts, setSelectedProducts] = useState<z.infer<typeof productSchema>[]>([])
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
  const isIncludeProduct = (product: z.infer<typeof productSchema>) => {
    return form.getValues("productIds").includes(product.id)
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
  useEffect(() => {
    setSelectedProducts(form.getValues('products'))
  }, [form.getValues('products')])
  if(isLoading) {
    <Loading/>
  }
  return (
    <Dialog open={dialog.isOpen} onOpenChange={(open) => setDialog((prev) => ({...prev, isOpen: open}))}>
      <DialogContent className="bg-white min-h-[95vh] h-full max-w-[95%] flex flex-col gap-2 overflow-auto">
        <DialogHeader>
          <DialogTitle>Choose Product</DialogTitle>
          <DialogDescription>Choose a product to add to the event</DialogDescription>
          <Button 
            type="button"
            className="self-end bg-slate-200 text-black hover:bg-slate-300"
            onClick={() => setSelectedProductsDialog({...selectedProductsDialog, isOpen: true})}
          >
            View selected products
          </Button>
          <SelectedProductDialog 
            dialog={selectedProductsDialog}
            setDialog={setSelectedProductsDialog}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            form={form}
          />
        </DialogHeader>
        <ProductSearchbar/>
        <div className="grid grid-cols-5 gap-4">
        {currentProducts.length === 0 && <p className="col-span-5 text-center">No products found.</p>}
        {currentProducts.map((product: z.infer<typeof productSchema>, index: number) => (
          <div 
            key={index} 
            className="relative w-full flex flex-col items-center gap-2 p-2 bg-slate-100 shadow rounded-xl"
          >
            <Checkbox 
              className="absolute top-2 right-2 h-6 w-6 border-slate-300 bg-white rounded-md"
              checked={isIncludeProduct(product)}
              onCheckedChange={(checked) => {
                if(checked) {
                  form.setValue("productIds", [...form.getValues("productIds"), product.id])
                  form.setValue("products", [...form.getValues("products"), product])
                  setSelectedProducts((prev) => [...prev, product])
                } else {
                  form.setValue("productIds", form.getValues("productIds").filter((id) => id !== product.id))
                  form.setValue("products", form.getValues("products").filter((selectedProduct) => selectedProduct.id !== product.id))
                  setSelectedProducts((prev) => prev.filter((selectedProduct) => selectedProduct.id !== product.id))
                }
              }}
            />
            <img src={product.displayImages[0]} className="h-[150px] w-[150px] object-contain rounded-sm" loading="lazy"/>
            <div className="w-full ml-5">
              <p className="font-bold text-wrap">{product.title.length > 60 ? product.title.slice(0, 60) + "..." : product.title}</p>
              <div className="flex flex-row gap-3">
              <p className="font-semibold text-orange-500">{displayPrice(product.variants)}</p>
                {isDiscount(product) && 
                  <div className="bg-red-100 text-red-500 rounded-md p-1">
                    <p className="text-[12px]">On sale!</p>
                  </div>
                }
              </div>
              <p className="text-[10px]">{categories?.find((category) => category.id === product.categoryId)?.name}</p>
            </div>
          </div>
        ))}
      </div>
      <CustomPagination currentPage={currentPage} totalPages={totalPages}/>
      </DialogContent>
    </Dialog>
  )
}
