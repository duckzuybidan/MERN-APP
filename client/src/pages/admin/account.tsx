import { profileSchema } from "@/schema"
import { signOut, updateProfile } from "@/store/auth-slice"
import { AppDispatch, RootState } from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { useState } from "react"
import ViewAdminDialog from "@/components/admin/account/view-admin-dialog"
import { addAdminEmail } from "@/store/admin-slice/others"
type ProfileFormField = {
  name: "username" | "email" 
  placeholder: string
  editable: boolean
}
const formFields : ProfileFormField[] = [
  {name: 'username', placeholder: 'Username...', editable: true},
  {name: 'email', placeholder: 'Email...', editable: false},
]
export default function Account() {
  const dispatch = useDispatch<AppDispatch>()
  const { adminEmails, isUpdating: isAdminOthersUpdating } = useSelector((state: RootState) => state.adminOthers)
  const { user, isUpdating: isUserUpdating } = useSelector(
      (state: RootState) => state.auth 
  )
  const [addAdminCurrentEmail, setAddAdminCurrentEmail] = useState("")
  const [viewAdminDialog, setViewAdminDialog] = useState({
    isOpen: false
  })
  const form = useForm({
      resolver: zodResolver(profileSchema),
      defaultValues: {
          id: user?.id || '',
          username: user?.username || '',
          email: user?.email || '',
          phone: user?.phone || '',
          avatar: user?.avatar || '',
          addresses: user?.addresses || [],
      }
  })
  const handleSignOut = () => {
    dispatch(signOut()).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
      }
    });
  }
  const onSubmit = (data: z.infer<typeof profileSchema>) => {
      dispatch(updateProfile(data)).then((res) => {
          if(res.payload.success) {
              toast.success(res.payload.message)
          }
          else {
              toast.error(res.payload.message)
          }
      })
  }
  const handleTriggerViewAdminDialog = () => {
    setViewAdminDialog({...viewAdminDialog, isOpen: true})
  }
  const handleAddAdminEmail = () => {
    dispatch(addAdminEmail(addAdminCurrentEmail)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
        setAddAdminCurrentEmail("")
      }
      else {
        toast.error(res.payload.message)
      }
    })
  }
  return (
    <div className="w-full flex flex-col gap-10 p-10">
      <h1 className="text-3xl font-semibold">Account</h1>
      <div className="w-full flex flex-col gap-3 shadow-xl p-3 rounded-md bg-slate-100">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {formFields.map((formField: ProfileFormField) => (
              <FormField
                  key={formField.name}
                  control={form.control}
                  name={formField.name}
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>{formField.name.toUpperCase()}</FormLabel>
                      <FormControl>
                      <Input
                          placeholder={formField.placeholder} 
                          className="border-x-transparent border-t-transparent border-b-slate-500"
                          disabled={!formField.editable}
                          {...field}
                      />
                      </FormControl>
                      <FormMessage className="text-red-500 text-[10px]"/>
                  </FormItem>
                  )}
              />
              ))}
              <div className="w-full flex justify-end">
              <Button 
                  type="submit" 
                  className="bg-black text-white"
                  disabled={isUserUpdating}
              >
                  {isUserUpdating ? <AiOutlineLoading3Quarters className="animate-spin text-white" /> : "Save Changes"}
              </Button>
              </div>
          </form>
      </Form>
      </div>
      <div className="w-full flex flex-col gap-2 shadow-xl p-3 rounded-md bg-slate-100">
        <h1 className="text-2xl font-semibold">Admins</h1>
        <span 
          className="text-[12px] text-sky-500 hover:underline hover:cursor-pointer"
          onClick={handleTriggerViewAdminDialog}
        >
          See all admins
        </span>
        <ViewAdminDialog 
          dialog={viewAdminDialog}
          setDialog={setViewAdminDialog}
          adminEmails={adminEmails}
        />
        <div className="w-full flex flex-col gap-3 bg-slate-200 p-3 rounded-md">
          <h1 className="text-xl">Add Admin</h1>
          <Input 
            placeholder="Email..." 
            value={addAdminCurrentEmail}
            onChange={(e) => setAddAdminCurrentEmail(e.target.value)}
          />
          <div className="w-full flex justify-end items-end">
            <Button 
              className="bg-black text-white"
              onClick={handleAddAdminEmail}
              disabled={isAdminOthersUpdating || !addAdminCurrentEmail}
            >
              {isAdminOthersUpdating ? <AiOutlineLoading3Quarters className="animate-spin text-white" /> : "Add Admin"}
            </Button>
        
          </div>
        </div>
      </div>
      <div className="w-full flex justify-end items-end">
        <Button 
          className="bg-red-500 text-white"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
        
      </div>
    </div>
  )
}
