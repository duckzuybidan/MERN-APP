import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
export type AuthFormField = {
  name: string
  placeholder: string
}
export default function AuthForm({
    form,
    onSubmit,
    formFields,
    isLoading
  }: {
    form: any,
    onSubmit: any,
    formFields: AuthFormField[],
    isLoading: boolean
  }) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formFields.map((formField: AuthFormField) => (
          <FormField
            key={formField.name}
            control={form.control}
            name={formField.name}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder={formField.placeholder}
                    type={formField.name.toUpperCase().includes("PASSWORD") ? "password" : "text"} 
                    className="border-x-transparent border-t-transparent border-b-slate-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-[10px]"/>
              </FormItem>
            )}
          />
        ))}
        <Button 
          type="submit" 
          className="w-full bg-red-500 hover:bg-red-200 text-white font-[500] rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? <AiOutlineLoading3Quarters className="animate-spin text-black" /> : "Submit"}
        </Button>
        
      </form>
    </Form>
  )
}
