import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import CategorySelect from "@/components/custom/category-select";
import ReactQuill from 'react-quill-new';
import 'react-quill/dist/quill.snow.css';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useRef, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, productVariantSchema } from "@/schema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {createProduct, deleteProduct, updateProduct } from "@/store/admin-slice/product";
import { toast } from "sonner";
import ProductVariantDialog from "./product-variant-dialog";
import EventSelect from "@/components/custom/event-select";
import useModalStore from "@/hooks/modal";
import { addProductForEvent, editProductForEvent, removeProductForEvent } from "@/store/admin-slice/event";
type ProductFormField = {
  name: "title" | "description" | "categoryId" | "displayImages" | "eventIds" | "variants"
  placeholder: string,
  type: "INPUT" | "TEXTAREA" | "FILE" | "SELECT" | "DIALOG" | "POPOVER"
}
type DialogFeild = {
  isOpen: boolean,
  mode: "ADD" | "EDIT"
}
const productFormFields : ProductFormField[] = [
  {name: "displayImages", placeholder: "Display Images", type: "FILE"},
  {name: "title", placeholder: "Title", type: "INPUT"},
  {name: "description", placeholder: "Description", type: "TEXTAREA"},
  {name: "categoryId", placeholder: "Category", type: "SELECT"},
  {name: "variants", placeholder: "Variants", type: "DIALOG"},
  {name: "eventIds", placeholder: "Events", type: "POPOVER"},
]
export default function ProductDialog({
  form,
  dialog,
  setDialog
}: {
  form: UseFormReturn<z.infer<typeof productSchema> & {variants: z.infer<typeof productVariantSchema>[] | any}>,
  dialog: DialogFeild,
  setDialog: React.Dispatch<React.SetStateAction<DialogFeild>>
}) {
  const { openModal, closeModal } = useModalStore();
  const productDisplayImagesFileRef = useRef<HTMLInputElement>(null)
  const editImageFileRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch<AppDispatch>();
  const {isUpdating} = useSelector((state: RootState) => state.product)
  const variantForm = useForm<z.infer<typeof productVariantSchema>>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: {
      id: "",
      productId: "",
      name: "",
      image: "",
      price: "",
      inStock: "",
      discountExpiry: "",
      discountPrice: ""
    }
  })
  const [editImageDialog, setEditImageDialog] = useState({
    isOpen: false,
    editImageIdx: -1
  })
  const [variantDialog, setVariantDialog] = useState({
      isOpen: false,
      mode: "ADD" as "ADD" | "EDIT",
      editVariantIdx: -1
    })
  
  const onSubmit = (data: z.infer<typeof productSchema>) => {
    data.updatedAt = new Date().toISOString()
    if(dialog.mode === "EDIT") {
      if(data.displayImages.length === 0) {
        form.setError("displayImages", {message: "Display images are required"});
        return
      }
      if(data.variants.length === 0) {
        form.setError("variants", {message: "Variants are required"});
        return
      }
      dispatch(updateProduct(data)).then((res) => {
        if(res.payload.success) {
          toast.success(res.payload.message)
          setDialog({...dialog, isOpen: false})
          dispatch(editProductForEvent(data))
          form.reset()
        } else {
          toast.error(res.payload.message)
        }
      })
      return
    }
    data.createdAt = new Date().toISOString()
    dispatch(createProduct(data)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
        setDialog({...dialog, isOpen: false})
        dispatch(addProductForEvent(data))
        form.reset()
      }
      else {
        toast.error(res.payload.message)
      }
    })
  }
  const handleTriggerEditImageDialog = (index: number) => {
    setEditImageDialog({isOpen: true, editImageIdx: index})
  }
  const handleProductDisplayImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }
    const imageFiles: string[] = [];
  
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image")) {
        toast.error("Please select only image files");
        return;
      }
      if (file.size > 1024 * 1024) {
        toast.error(`File size should be less than 1MB - ${file.name}`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          imageFiles.push(e.target.result as string);
          if (imageFiles.length === Array.from(files).length) {
            form.setValue("displayImages", [...form.getValues("displayImages"), ...imageFiles]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if(!file) {
      return
    }
    if(!file.type.startsWith("image")) {
      toast.error("Please select an image file")
      return
    }
    if(file.size > 1024 * 1024) {
      toast.error("File size should be less than 1MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      if(e.target?.result) {
        const newDisplayImages = form.getValues("displayImages")
        newDisplayImages[editImageDialog.editImageIdx] = e.target.result as string
        form.setValue("displayImages", newDisplayImages)
      }
    }
    reader.readAsDataURL(file)
  }
  const handleDeleteImage = () => {
    const newDisplayImages = form.getValues("displayImages")
    newDisplayImages.splice(editImageDialog.editImageIdx, 1)
    form.setValue("displayImages", newDisplayImages)
    setEditImageDialog({...editImageDialog, isOpen: false})
  }
  const handleTriggerAddVariantsDialog = () => {
    setVariantDialog({...variantDialog, isOpen: true, mode: "ADD"})
    variantForm.reset()
  }
  const handleOpenDeleteModal = (product: z.infer<typeof productSchema>) => {
    openModal({type: "DELETE", title: "product", onSubmit: () => handleDeleteProduct(product)})
  }
  const handleTriggerEditVariantDialog = (variant: z.infer<typeof productVariantSchema>, idx: number) => {
    setVariantDialog({editVariantIdx: idx, isOpen: true, mode: "EDIT"})
    variantForm.setValue("id", variant.id)
    variantForm.setValue("name", variant.name)
    variantForm.setValue("image", variant.image)
    variantForm.setValue("price", variant.price)
    variantForm.setValue("inStock", variant.inStock)
    variantForm.setValue("discountPrice", variant.discountPrice)
    variantForm.setValue("discountExpiry", variant.discountExpiry)
  }
  const isOnTime = (variant: z.infer<typeof productVariantSchema>) => {
    const expiry = variant.discountExpiry ? new Date(variant.discountExpiry) : null
    return expiry && expiry > new Date() && variant.discountPrice !== ""
  }
  const handleDeleteProduct = (product: z.infer<typeof productSchema>) => {
    dispatch(deleteProduct(product.id)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
        setDialog({...dialog, isOpen: false})
        dispatch(removeProductForEvent(product))
        closeModal()
      } else {
        toast.error(res.payload.message)
      }
    })
  }
  return (
    <Dialog
      open={dialog.isOpen}
      onOpenChange={(open) =>
        setDialog((prev) => ({ ...prev, isOpen: open }))
      }
    >
      <DialogContent className="bg-white min-w-[90%] h-[90%] overflow-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <DialogHeader>
              <DialogTitle>
                {dialog.mode === "ADD" ? "Add New Product" : "Edit Product"}
              </DialogTitle>
              <DialogDescription>
                {dialog.mode === "ADD" ? "Add new product" : "Edit product"}
              </DialogDescription>
            </DialogHeader>
            {productFormFields.map((formField: ProductFormField) => (
              <FormField
                key={formField.name}
                control={form.control}
                name={formField.name}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row items-center">
                      <FormLabel>{formField.placeholder.toUpperCase()}</FormLabel>
                      {formField.name === "displayImages" && (
                        <Button
                          type="button"
                          onClick={() =>productDisplayImagesFileRef.current?.click()}
                        >
                          <IoMdAdd size={20} />
                        </Button>
                      )}
                      {formField.name === "variants" && (
                        <Button
                          type="button"
                          onClick={handleTriggerAddVariantsDialog}
                        >
                          <IoMdAdd size={20} />
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <>
                        {formField.type === "FILE" && (
                          <>
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              multiple
                              ref={productDisplayImagesFileRef}
                              onChange={handleProductDisplayImagesChange}
                            />
                            {form.getValues("displayImages").length > 0 && (
                              <Carousel
                                opts={{
                                  align: "start",
                                  loop: true,
                                }}
                                className="h-full w-[300px] aspect-square bg-slate-100"
                              >
                                <CarouselContent>
                                  {form.getValues("displayImages").map((image, index) => (
                                    <CarouselItem
                                      className="flex flex-col cursor-pointer"
                                      key={index}
                                      onClick={() =>
                                        handleTriggerEditImageDialog(index)
                                      }
                                    >
                                      <img
                                        src={image}
                                        alt={`Image ${index + 1}`}
                                        className="w-[300px] h-[300px] object-contain"
                                        loading="lazy"
                                      />
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                              </Carousel>
                            )}
                            <Dialog
                              open={editImageDialog.isOpen}
                              onOpenChange={(open) =>
                                setEditImageDialog((prev) => ({
                                  ...prev,
                                  isOpen: open,
                                }))
                              }
                            >
                              <DialogContent className="bg-white">
                                <DialogHeader>
                                  <DialogTitle>Edit Image</DialogTitle>
                                  <DialogDescription>Edit image</DialogDescription>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={editImageFileRef}
                                    onChange={handleImageChange}
                                  />
                                  <div className="flex flex-col gap-2 bg-slate-100">
                                    <img
                                      src={
                                        form.getValues("displayImages")[editImageDialog.editImageIdx]
                                      }
                                      alt={`Image ${editImageDialog.editImageIdx + 1}`}
                                      className="w-[300px] h-[300px] object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="flex flex-row gap-2">
                                    <Button
                                      type="button"
                                      className="bg-red-500"
                                      onClick={handleDeleteImage}
                                    >
                                      Delete Image
                                    </Button>
                                    <Button
                                      type="button"
                                      className="bg-slate-300"
                                      onClick={() =>
                                        editImageFileRef.current?.click()
                                      }
                                    >
                                      Edit Image
                                    </Button>
                                  </div>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        {formField.type === "INPUT" && (
                          <Input
                            placeholder={formField.placeholder}
                            className="p-2 border-2 border-slate-300 focus:border-none"
                            {...field}
                          />
                        )}
                        {formField.type === "TEXTAREA" && (
                          <div className="h-[400px]">
                            <ReactQuill
                              theme="snow"
                              placeholder={formField.placeholder}
                              className="h-[80%]"
                              {...field}
                            />
                          </div>
                        )}
                        {formField.type === "SELECT" && formField.name === "categoryId" && (
                          <CategorySelect 
                            defaultValue={form.getValues("categoryId")} 
                            value={form.getValues("categoryId")}
                            onChange={(value) => form.setValue("categoryId", value)}
                          />
                          )}
                        {formField.type === "DIALOG" && formField.name === "variants" && (
                            <>  
                              <ProductVariantDialog 
                                form={variantForm}
                                productForm={form}
                                dialog={variantDialog}
                                setDialog={setVariantDialog}  
                              />
                              <div className="w-full flex flex-row flex-wrap gap-1">
                                {form.getValues("variants").map((variant: z.infer<typeof productVariantSchema>,index: number) => (
                                  <div
                                    key={index}
                                    className="w-max flex flex-col gap-2 py-2 px-5 bg-slate-300 rounded-xl hover:bg-slate-200 cursor-pointer"
                                    onClick={() =>
                                      handleTriggerEditVariantDialog(variant,index)
                                    }
                                  >
                                    <div className="flex flex-row gap-2 items-center">
                                      <img
                                        src={variant.image}
                                        className="h-10 w-10 object-cover"
                                        loading="lazy"
                                      />
                                      <p>{variant.name}</p>
                                    </div>
                                    <>
                                    {isOnTime(variant) && variant.discountPrice ? (
                                      <div className="flex flex-row gap-1">
                                        <span className="text-sm font-semibold text-orange-500">${variant.discountPrice}</span>
                                        <span className="text-sm font-semibold text-slate-500 line-through">${variant.price}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm font-semibold text-orange-500">${variant.price}</span>
                                    )}
                                    </>
                                    <p className="text-sm font-semibold">In Stock: <span className="font-[400]">{variant.inStock}</span></p>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        {formField.type === "POPOVER" && formField.name === "eventIds" && (
                          <EventSelect 
                            eventIds={form.getValues("eventIds")} 
                            onChange={(eventIds) => form.setValue("eventIds", eventIds)}
                          />
                        )}
                      </>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter>
              {dialog.mode === "EDIT" && (
                <Button
                  type="button"
                  className="bg-red-500"
                  onClick={() => handleOpenDeleteModal(form.getValues())}
                >
                  Delete Product
                </Button>
              )}
              <Button
                type="submit"
                className="bg-black text-white"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  `${dialog.mode === "ADD" ? "Add Product" : "Save Changes"}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
