import { eventSchema, productSchema, productVariantSchema } from "@/schema"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UseFormReturn } from "react-hook-form";
import { TbXboxX } from "react-icons/tb";
import { Button } from "@/components/ui/button";
type DialogFeild = {
    isOpen: boolean
}
export default function SelectedProductDialog({
    dialog,
    setDialog,
    form,
    selectedProducts,
    setSelectedProducts,
}: {
    dialog: DialogFeild,
    setDialog: React.Dispatch<React.SetStateAction<DialogFeild>>,
    form: UseFormReturn<z.infer<typeof eventSchema>>,
    selectedProducts: z.infer<typeof productSchema>[],
    setSelectedProducts: React.Dispatch<React.SetStateAction<z.infer<typeof productSchema>[]>>
}) {
  const isDiscount = (product: z.infer<typeof productSchema>) => {
    const findDiscountVariant = product.variants.find((variant) => {
      const expiry = variant.discountExpiry ? new Date(variant.discountExpiry) : null
      return expiry && expiry > new Date() && variant.discountPrice !== ""
    })
    return !!findDiscountVariant
  }
  const handleUnselectProduct = (product: z.infer<typeof productSchema>) => {
    setSelectedProducts(selectedProducts.filter((selectedProduct) => selectedProduct.id !== product.id))
    form.setValue("productIds", form.getValues("productIds").filter((id) => id !== product.id))
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
  return (
    <Dialog open={dialog.isOpen} onOpenChange={(open) => setDialog((prev) => ({...prev, isOpen: open}))}>
      <DialogContent className="bg-white min-h-[95vh] h-full max-w-[95%] flex flex-col gap-2 overflow-auto">
        <DialogHeader>
          <DialogTitle>Choose Product</DialogTitle>
          <DialogDescription>Choose a product to add to the event</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-4">
        {selectedProducts.length === 0 && <p className="col-span-5 text-center">No products selected.</p>}
        {selectedProducts.map((product: z.infer<typeof productSchema>, index: number) => (
          <div 
            key={index} 
            className="relative w-full flex flex-col items-center gap-2 p-2 bg-slate-100 shadow rounded-xl"
          >
            <Button 
              className="absolute p-2 top-0 right-0 hover:bg-red-100" 
              onClick={() => handleUnselectProduct(product)}
            >
              <TbXboxX/>
            </Button>
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
            </div>
          </div>
        ))}
      </div>
      </DialogContent>
    </Dialog>
  )
}
