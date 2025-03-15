import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { profileSchema } from "@/schema"
import { updateProfile } from "@/store/auth-slice"
import { AppDispatch, RootState } from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { z } from "zod"
import { RiImageEditLine } from "react-icons/ri";
import AddressesDialog from "@/components/user/profile/addresses-dialog"
type ProfileFormField = {
    name: "username" | "email" | "phone" | "avatar" | "addresses"
    placeholder: string
    editable: boolean
    type: "INPUT" | "DIALOG"
}
const formFields : ProfileFormField[] = [
    {name: 'username', placeholder: 'Username...', editable: true, type: "INPUT"},
    {name: 'email', placeholder: 'Email...', editable: false, type: "INPUT"},
    {name: 'phone', placeholder: 'Phone...', editable: true, type: "INPUT"},
    {name: 'addresses', placeholder: 'Address...', editable: true, type: "DIALOG"},
]
export default function Profile() {
    const dispatch = useDispatch<AppDispatch>()
    const { user, isUpdating } = useSelector(
        (state: RootState) => state.auth 
    )
    const [addressesDialog, setAddressesDialog] = useState({
        isOpen: false
    })
    const avatarFileRef = useRef<HTMLInputElement>(null)
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            id: user?.id || '',
            username: user?.username || '',
            email: user?.email || '',
            phone: user?.phone || '',
            avatar: user?.avatar || '',
            addresses: user?.addresses || []
        }
    })
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
    const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(!file){
            toast.error('No file selected')
            return
        }
        if(!file.type.startsWith('image')){
            toast.error('Please select an image file')
            return
        }
        if(file.size > 1024 * 1024){
            toast.error('File size should be less than 1MB')
            return
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            form.setValue('avatar', e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
    }
    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="w-1/2 flex flex-col gap-4 h-max rounded-lg shadow-lg p-5">
                <h1 className="text-2xl font-semibold text-orange-500">Your Profile</h1>
                <Separator  orientation="horizontal" className="w-1/2 bg-slate-300"/>
                <input type="file" hidden ref={avatarFileRef} onChange={handleAvatarFileChange} accept="image/*"/>
                <div className="relative flex flex-row items-end w-24 h-24">
                    <img 
                        src={form.watch('avatar')} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover" 
                    />
                    <div className="flex justify-center items-center absolute right-0 bottom-0 cursor-pointer p-1 rounded-full bg-slate-500 ">
                        <RiImageEditLine 
                            size={20} 
                            color="white"
                            onClick={() => avatarFileRef.current?.click()}
                        />
                    </div>
                </div>
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
                                {formField.type === "INPUT" && typeof field.value === "string" && (
                                    <FormControl>
                                    <Input
                                        placeholder={formField.placeholder} 
                                        className="border-x-transparent border-t-transparent border-b-slate-300"
                                        disabled={!formField.editable}
                                        {...field}
                                        value={field.value}
                                    />
                                    </FormControl>
                                )}
                                {formField.type === "DIALOG" && (
                                    <>
                                        <div 
                                            className="cursor-pointer text-sky-500 hover:underline text-[12px]"
                                            onClick={() => setAddressesDialog({isOpen: true})}
                                        >
                                            View Addresses
                                        </div>
                                        <AddressesDialog
                                            dialog={addressesDialog}
                                            setDialog={setAddressesDialog}
                                            form={form}
                                        />
                                    </>
                                )}
                                <FormMessage className="text-red-500 text-[10px]"/>
                            </FormItem>
                            )}
                        />
                        ))}
                        <div className="w-full flex justify-end">
                        <Button 
                            type="submit" 
                            className="w-1/4 bg-red-500 hover:bg-red-200 text-white font-bold text-lg rounded-xl"
                            disabled={isUpdating}
                        >
                            {isUpdating ? <AiOutlineLoading3Quarters className="animate-spin text-black" /> : "Save Changes"}
                        </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
