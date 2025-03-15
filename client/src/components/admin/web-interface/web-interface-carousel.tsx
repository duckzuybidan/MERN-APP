import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DialogTooltip, DialogTooltipTrigger } from "@/components/ui/dialog+tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipContent } from "@/components/ui/tooltip";
import { webInterfaceSchema } from "@/schema";
import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoPersonAddSharp } from "react-icons/io5";
import { z } from "zod";
abstract class FormField {
    name: string;
    placeholder: string;
    type: string;
    constructor(name: string, placeholder: string, type: string) {
        this.name = name;
        this.placeholder = placeholder;
        this.type = type;
    }
}
type DialogFeild = {
    isDialogOpen: boolean;
    updateCurrentIndex: number;
    isLoading: boolean;
}

export default function WebInterfaceCarousel({
    title,
    formFields,
    data,
    setData,
    avatarFileRef,
    handleImageFileChange,
    handleAddUpdate,
    handleDelete,
    dialog,
    setDialog,
    form,
    itemName,
    onOpenChange,
}: {
    title: string;
    formFields: FormField[];
    data: any;
    setData: React.Dispatch<React.SetStateAction<any>>;
    avatarFileRef: any;
    handleImageFileChange: any;
    handleAddUpdate: any;
    handleDelete: any;
    dialog: DialogFeild;
    setDialog: React.Dispatch<React.SetStateAction<DialogFeild>>;
    form: UseFormReturn<z.infer<typeof webInterfaceSchema>>;
    itemName: "managers" | "banners";
    onOpenChange: () => void;
}) {
    return (
      <>
        <div className="flex flex-row items-center gap-3">
          <h2 className="text-xl font-semibold text-sky-500 mb-3">{title}s</h2>
          <DialogTooltip dialogProps={{ onOpenChange: onOpenChange }}>
            <DialogTooltipTrigger dialogTriggerProps={{ asChild: true }} tooltipTriggerProps={{ asChild: true }}>
              <IoPersonAddSharp size={20} className="mb-2 hover:cursor-pointer" />
            </DialogTooltipTrigger>
            <TooltipContent side="right">
              <p className="text-black font-semibold">Add new {title}</p>
            </TooltipContent>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Add New {title}</DialogTitle>
                <DialogDescription>Add new {title} to display on about page</DialogDescription>
              </DialogHeader>
              {formFields.map((formField: FormField) => (
                <div key={formField.name} className="flex flex-col gap-3">
                  <Label>{formField.name.toUpperCase()}</Label>
                  {formField.type === "INPUT" && (
                    <Input
                      placeholder={formField.placeholder}
                      className="p-2 border-2 border-slate-300 focus:border-none"
                      value={data[formField.name]}
                      onChange={(e) =>
                        setData({ ...data, [formField.name]: e.target.value })
                      }
                    />
                  )}
                  {formField.type === "FILE" && (
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarFileRef}
                        onChange={handleImageFileChange}
                      />
                      {data.image && (
                        <img src={data.image} className="h-[200px] w-[150px]" loading="lazy" />
                      )}
                      <Button
                        onClick={() => avatarFileRef.current?.click()}
                        className="bg-slate-300 w-1/3"
                      >
                        {formField.placeholder}
                      </Button>
                    </>
                  )}
                </div>
              ))}
              <DialogFooter>
                <Button
                  onClick={handleAddUpdate}
                  className="bg-black text-white"
                  disabled={dialog.isLoading}
                >
                  {dialog.isLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin text-white" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogTooltip>
        </div>
        <Dialog
          open={dialog.isDialogOpen}
          onOpenChange={(open) =>
            setDialog((prev) => ({ ...prev, isDialogOpen: open }))
          }
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="h-[200px] aspect-[6/4] ml-10"
          >
            <CarouselContent>
                {itemName === "managers" && form.getValues(itemName).map((item, index) => (
                    <DialogTrigger asChild key={item.name}>
                        <CarouselItem
                            className="flex flex-col basis-1/2"
                            onClick={() => {
                                setData(item);
                                setDialog({
                                    ...dialog,
                                    updateCurrentIndex: index,
                                    isDialogOpen: true,
                                });
                            }}
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="rounded-xl w-[90%] h-[90%] object-cover"
                                loading="lazy"
                            />
                            <div>
                                <h1 className="text-xl font-semibold">{item.name}</h1>
                                <p>{item.position}</p>
                            </div>
                        </CarouselItem>
                    </DialogTrigger>
                ))}
                {itemName === "banners" && form.getValues(itemName).map((item, index) => (
                    <DialogTrigger asChild key={item.link}>
                        <CarouselItem 
                            className='flex flex-col' 
                            onClick={() => {
                                setData(item)
                                setDialog({
                                    ...dialog,
                                    updateCurrentIndex: index,
                                    isDialogOpen: true,
                                })
                            }}
                        >
                            <img 
                                src={item.image} 
                                alt={item.link} 
                                className='rounded-xl w-full h-full object-cover'
                                loading='lazy'
                            />
                        </CarouselItem>
                    </DialogTrigger>
                ))}
            </CarouselContent>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Update {title}</DialogTitle>
                <DialogDescription>Update {title} information</DialogDescription>
              </DialogHeader>
              {formFields.map((formField: FormField) => (
                <div key={formField.name} className="flex flex-col gap-3">
                  <Label>{formField.name.toUpperCase()}</Label>
                  {formField.type === "INPUT" && (
                    <Input
                      placeholder={formField.placeholder}
                      className="p-2 border-2 border-slate-300 focus:border-none"
                      value={data[formField.name]}
                      onChange={(e) =>
                        setData({ ...data, [formField.name]: e.target.value })
                      }
                    />
                  )}
                  {formField.type === "FILE" && (
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarFileRef}
                        onChange={handleImageFileChange}
                      />
                      {data.image && (
                        <img src={data.image} className={`${itemName === "managers" && "h-[200px] w-[150px]"} ${itemName === "banners" && "h-full w-full"}`} loading="lazy" />
                      )}
                      <Button
                        onClick={() => avatarFileRef.current?.click()}
                        className="bg-slate-300 w-1/3"
                      >
                        {formField.placeholder}
                      </Button>
                    </>
                  )}
                </div>
              ))}
              <DialogFooter>
                <Button
                  onClick={handleDelete}
                  className="bg-red-500 text-white"
                  disabled={dialog.isLoading}
                >
                  Delete {title}
                </Button>
                <Button
                  onClick={handleAddUpdate}
                  className="bg-black text-white"
                  disabled={dialog.isLoading}
                >
                  {dialog.isLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin text-white" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
            {form.getValues(itemName).length > 0 && (
              <CarouselNext className="bg-black text-white" />
            )}
            {form.getValues(itemName).length > 0 && (
              <CarouselPrevious className="bg-black text-white" />
            )}
          </Carousel>
        </Dialog>
      </>
    );
  }
  