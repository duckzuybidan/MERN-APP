import { Separator } from "@/components/ui/separator"
import { IoCallOutline } from "react-icons/io5";
import { CiMail } from "react-icons/ci";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/schema";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
type ContactFormField = {
  name: "name" | "email" | "phone" | "message",
  placeholder: string,
  type: "TEXTAREA" | "INPUT"
}
const formFields : ContactFormField[] = [
  {name: 'name', placeholder: 'Your Name', type: "INPUT"},
  {name: 'email', placeholder: 'Your Email', type: "INPUT"},
  {name: 'phone', placeholder: 'Your Phone', type: "INPUT"},
  {name: 'message', placeholder: 'Your Message', type: "TEXTAREA"},
]
export default function Contact() {
  const location = useLocation()
  const {webInterfaceData} = useSelector((state: RootState) => state.webInterface)
  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  })
  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    console.log(data)
  }
  useEffect(() => {
    scrollTo(0, 0)
  }, [location.pathname])
  return (
    <div className="w-full h-full flex flex-row items-center justify-around mt-[150px]">
      <div className="flex flex-col px-8 py-12 shadow-xl min-h-1/2 mt-[00px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-3 items-center">
            <div className="bg-red-500 p-2 rounded-full"><IoCallOutline color="white" size={30}/></div>
            <h1 className="text-2xl font-semibold">Call To Us</h1>
          </div>
          <p className="font-medium">We are available 24/7, 7 days a week.</p>
          <p className="font-medium">Phone: {webInterfaceData?.contact.phone}</p>
        </div>
        <Separator className="my-5 bg-slate-500"/>
        <div className="flex flex-col gap-5">
          <div className="flex flex-row gap-3 items-center">
            <div className="bg-red-500 p-2 rounded-full"><CiMail color="white" size={30}/></div>
            <h1 className="text-2xl font-semibold">Write To Us</h1>
          </div>
          <p className="font-medium">Fill out our form and we contact you within 24 hours.</p>
          <p className="font-medium">Email: {webInterfaceData?.contact.email}</p>
        </div>
      </div>
      <div className="flex flex-col px-8 py-12 shadow-xl min-h-1/2 w-1/2">
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row flex-wrap gap-5">
        {formFields.map((formField: ContactFormField) => (
          <FormField
            key={formField.name}
            control={form.control}
            name={formField.name}
            render={({ field }) => (
              <FormItem className={`${formField.type === "INPUT" ? "w-[30%] h-1/5" : "w-full"}`}>
                <FormControl>
                  <>
                  {formField.type === "INPUT" && (
                    <Input
                      placeholder={formField.placeholder}
                      className="p-3 h-[80%] border-transparent bg-slate-100 rounded-xl"
                      {...field}
                    />
                  )}
                  {formField.type === "TEXTAREA" && (
                    <Textarea
                      placeholder={formField.placeholder}
                      className="p-3 border-transparent bg-slate-100 rounded-xl"
                      rows={8}
                      {...field}
                    />
                  )}
                  </>
                </FormControl>
                <FormMessage className="text-red-500 text-[10px]"/>
              </FormItem>
            )}
          />
        ))}
        <div className="w-full flex justify-end">
          <Button 
            type="submit" 
            className="w-1/4 bg-red-500 hover:bg-red-200 text-white font-bold text-lg rounded-xl"
          >
            Send Message
          </Button>
        </div>
      </form>
    </Form>
      </div>
    </div>
  )
}
