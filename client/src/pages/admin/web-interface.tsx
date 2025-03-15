
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { webInterfaceSchema } from "@/schema";
import { AppDispatch, RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as z from "zod";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa6";
import { updateWebInterface } from "@/store/web-interface-slice";
import { toast } from "sonner";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useRef, useState } from "react";
import { storage } from "@/firebase";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import { IconType } from "react-icons/lib";
import WebInterfaceCarousel from "@/components/admin/web-interface/web-interface-carousel";
type NameFormFeild = {
    name: "name" | "about"
    label: string,
    placeholder: string
    type: "INPUT" | "TEXTAREA"
}
type ContactFormFeild = {
    name: "contact.phone" | "contact.email" | "contact.address"
    label: string
    placeholder: string
}
type SocialFormField = {
    name: "contact.social.Facebook" | "contact.social.Instagram" | "contact.social.Twitter" | "contact.social.Youtube"
    icon: IconType
    placeholder: string
}
type ManagerFormField = {
    name: "image" | "name" | "position"
    placeholder: string
    type: "INPUT" | "FILE"
}
type BannerFormField = {
    name: "image" | "link"
    placeholder: string
    type: "INPUT" | "FILE"
}
const nameFormField: NameFormFeild[] = [
    {name: "name", label: "Web Name", placeholder: "Your Web Name", type: "INPUT"},
    {name: "about", label: "About", placeholder: "About Your Web", type: "TEXTAREA"},
]
const contactnameFormField: ContactFormFeild[] = [
    {name: "contact.phone", label: "Phone Number", placeholder: "Phone Number"},
    {name: "contact.email", label: "Email", placeholder: "Email"},
    {name: "contact.address", label: "Address", placeholder: "Address"},
]
const socialFormFields: SocialFormField[] = [
    {name: "contact.social.Facebook", icon: FaFacebook, placeholder: "Facebook Link"},
    {name: "contact.social.Instagram", icon: FaInstagram, placeholder: "Instagram Link"},
    {name: "contact.social.Twitter", icon: FaTwitter, placeholder: "Twitter Link"},
    {name: "contact.social.Youtube", icon: FaYoutube, placeholder: "Youtube Link"},
]
const managerFormFields: ManagerFormField[] = [
    {name: "image", placeholder: "Choose Image", type: "FILE"},
    {name: "name", placeholder: "Name", type: "INPUT"},
    {name: "position", placeholder: "Position", type: "INPUT"},
]
const bannerFormFields: BannerFormField[] = [
    {name: "image", placeholder: "Choose Image", type: "FILE"},
    {name: "link", placeholder: "URL for this banner", type: "INPUT"}
]

export default function WebInterface() {
    const managerAvatarFileRef = useRef<HTMLInputElement>(null)
    const bannerImageFileRef = useRef<HTMLInputElement>(null)
    const dispatch = useDispatch<AppDispatch>()
    const { webInterfaceData, isUpdating } = useSelector((state: RootState) => state.webInterface)
    const [managerData, setManagerData] = useState({
        image: "",
        name: "",
        position: "",
    })
    const [managerDialog, setManagerDialog] = useState({
        isDialogOpen: false,
        updateCurrentIndex: -1,
        isLoading: false
    })
    const [bannerData, setBannerData] = useState({
        image: "",
        link: ""
    })
    const [bannerDialog, setBannerDialog] = useState({
        isDialogOpen: false,
        updateCurrentIndex: -1,
        isLoading: false
    })
    const form = useForm({
        resolver: zodResolver(webInterfaceSchema),
        defaultValues: {
            name: webInterfaceData?.name || "",
            about: webInterfaceData?.about || "",
            contact: {
                phone: webInterfaceData?.contact?.phone || "",
                email: webInterfaceData?.contact?.email || "",
                address: webInterfaceData?.contact?.address || "",
                social: {
                    Facebook: webInterfaceData?.contact?.social?.Facebook || "",
                    Instagram: webInterfaceData?.contact?.social?.Instagram || "",
                    Twitter: webInterfaceData?.contact?.social?.Twitter || "",
                    Youtube: webInterfaceData?.contact?.social?.Youtube || "",
                }
            },
            managers: webInterfaceData?.managers || [],
            banners: webInterfaceData?.banners || [],
        }
    })
    const onSubmit = (data: z.infer<typeof webInterfaceSchema>) => {
        dispatch(updateWebInterface(data)).then((res) => {
            if(res.payload.success) {
                toast.success(res.payload.message)
            }
            else {
                toast.error(res.payload.message)
            }
        })
    }
    const handleManagerImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(!file) {
            toast.error("No file selected")
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
        const reader = new FileReader();
        reader.onload = (e) => {
            setManagerData({...managerData, image: e.target?.result as string})
        };
        reader.readAsDataURL(file);
    }
    const handleAddUpdateManager = async () => {
        if(!managerData.image || !managerData.name || !managerData.position) {
            toast.error("Please fill in all the fields")
            return
        }
        setManagerDialog({...managerDialog, isLoading: true})
        try {
            if(managerData.image.includes("https://")) {
                form.setValue("managers", [...form.getValues("managers").slice(0, managerDialog.updateCurrentIndex), {
                    image: managerData.image,
                    name: managerData.name,
                    position: managerData.position
                }, ...form.getValues("managers").slice(managerDialog.updateCurrentIndex + 1)])
                toast.success("Manager updated successfully")
                setManagerData({image: "", name: "", position: ""})
                setManagerDialog({isDialogOpen: false, updateCurrentIndex: -1, isLoading: false})
                return
            }
            const base64Response = await fetch(managerData.image);
            const blob = await base64Response.blob();
            const storageRef = ref(storage, `managers/${managerDialog.updateCurrentIndex !== -1 ? managerDialog.updateCurrentIndex + 1 : form.getValues("managers").length + 1}`);
            uploadBytes(storageRef, blob)
            .then((snapshot) => {
                return getDownloadURL(snapshot.ref);
            })
            .then((downloadURL) => {
                if(managerDialog.updateCurrentIndex !== -1) {
                    form.setValue("managers", [...form.getValues("managers").slice(0, managerDialog.updateCurrentIndex), {
                        image: downloadURL,
                        name: managerData.name,
                        position: managerData.position
                    }])
                    toast.success("Manager updated successfully")
                    setManagerData({image: "", name: "", position: ""})
                    setManagerDialog({isDialogOpen: false, updateCurrentIndex: -1, isLoading: false})
                    return
                }
                form.setValue("managers", [...form.getValues("managers"), {
                    image: downloadURL,
                    name: managerData.name,
                    position: managerData.position
                }])
                toast.success("Manager added successfully")
                setManagerData({image: "", name: "", position: ""})
                setManagerDialog({...managerDialog, isLoading: false})
            })
            .catch(() => {
                throw new Error('Something went wrong, please try again!');
            });
            
        } catch (error: any) {
            setManagerDialog({...managerDialog, isLoading: false})
            console.log(error)
            toast.error(error.message)
        }
    }
    const handleDeleteManager = async () => {
        form.setValue("managers", [...form.getValues("managers").slice(0, managerDialog.updateCurrentIndex), ...form.getValues("managers").slice(managerDialog.updateCurrentIndex + 1)])
        setManagerData({image: "", name: "", position: ""})
        setManagerDialog({...managerDialog, updateCurrentIndex: -1})
        toast.success("Manager deleted successfully")
        setManagerDialog({...managerDialog, isDialogOpen: false})
    }
    const handleBannerImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(!file) {
            toast.error("No file selected")
            return
        }
        if(!file.type.startsWith("image")) {
            toast.error("Please select an image file")
            return
        }
        if(file.size > 2 * 1024 * 1024) {
            toast.error("File size should be less than 2MB")
            return
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setBannerData({...bannerData, image: e.target?.result as string})
        };
        reader.readAsDataURL(file);
    }
    const handleAddUpdateBanner = async () => {
        if(!bannerData.image || !bannerData.link) {
            toast.error("Please fill in all the fields")
            return
        }
        setBannerDialog({...bannerDialog, isLoading: true})
        try {
            if(bannerData.image.includes("https://")) {
                form.setValue("banners", [...form.getValues("banners").slice(0, bannerDialog.updateCurrentIndex), {
                    image: bannerData.image,
                    link: bannerData.link
                }, ...form.getValues("banners").slice(bannerDialog.updateCurrentIndex + 1)])
                toast.success("Banner updated successfully")
                setBannerData({image: "", link: ""})
                setBannerDialog({isDialogOpen: false, updateCurrentIndex: -1, isLoading: false})
                return
            }
            const base64Response = await fetch(bannerData.image);
            const blob = await base64Response.blob();
            const storageRef = ref(storage, `banners/${bannerDialog.updateCurrentIndex !== -1 ? bannerDialog.updateCurrentIndex + 1 : form.getValues("banners").length + 1}`);
            uploadBytes(storageRef, blob)
            .then((snapshot) => {
                return getDownloadURL(snapshot.ref);
            })
            .then((downloadURL) => {
                if(managerDialog.updateCurrentIndex !== -1) {
                    form.setValue("banners", [...form.getValues("banners").slice(0, bannerDialog.updateCurrentIndex), {
                        image: downloadURL,
                        link: bannerData.link
                    }])
                    toast.success("Banner updated successfully")
                    setBannerData({image: "", link: ""})
                    setBannerDialog({isDialogOpen: false, updateCurrentIndex: -1, isLoading: false})
                    return
                }
                form.setValue("banners", [...form.getValues("banners"), {
                    image: downloadURL,
                    link: bannerData.link
                }])
                toast.success("Banner added successfully")
                setBannerData({image: "", link: ""})
                setBannerDialog({...bannerDialog, isLoading: false})
            })
            .catch(() => {
                throw new Error('Something went wrong, please try again!');
            });
            
        } catch (error: any) {
            setBannerDialog({...bannerDialog, isLoading: false})
            console.log(error)
            toast.error(error.message)
        }
    }
    const handleDeleteBanner = async () => {
        form.setValue("banners", [...form.getValues("banners").slice(0, bannerDialog.updateCurrentIndex), ...form.getValues("banners").slice(bannerDialog.updateCurrentIndex + 1)])
        setBannerData({image: "", link: ""})
        toast.success("Banner deleted successfully")
        setBannerDialog({...bannerDialog, updateCurrentIndex: -1, isDialogOpen: false})
    }
    return (
        <div className="w-full p-10 flex flex-col gap-10">
        <h1 className="text-3xl font-semibold">Web Interface</h1>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-row gap-5">
                {nameFormField.map((formField: NameFormFeild) => (
                    <FormField
                        key={formField.name}
                        control={form.control}
                        name={formField.name}
                        render={({ field }) => (
                        <FormItem className="w-1/2">
                            <FormLabel className="text-xl font-semibold text-sky-500">{formField.label}</FormLabel>
                            <FormControl>
                                <>
                                {formField.type === "INPUT" && 
                                <Input 
                                    className="border-2 border-slate-300 focus:border-none" 
                                    placeholder={formField.placeholder} 
                                    {...field}
                                />}
                                {formField.type === "TEXTAREA" && 
                                <Textarea 
                                    className="border-2 border-slate-300 focus:border-none" 
                                    placeholder="About..." 
                                    rows={7}
                                    {...field}
                                />}
                                </>
                            </FormControl>
                            <FormMessage className="text-red-500 text-[10px]"/>
                        </FormItem>
                        )}
                    />
                ))}
                </div>
                <div className="w-full space-y-5">
                    <h2 className="text-xl font-semibold text-sky-500 mb-3">Contact</h2>
                    <div className="flex flex-row gap-5">
                        {contactnameFormField.map((formField: ContactFormFeild) => (
                            <FormField
                                key={formField.name}
                                control={form.control}
                                name={formField.name}
                                render={({ field }) => (
                                <FormItem className="w-1/3">
                                    <FormLabel>{formField.label}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            className="border-2 border-slate-300 focus:border-none" 
                                            placeholder={formField.placeholder} 
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-[10px]"/>
                                </FormItem>
                                )}
                            />
                
                        ))}
                    </div>
                    <div>
                        <h2 className="font-medium mb-3">Social</h2>
                        <div className="grid grid-cols-2 gap-3">
                        {socialFormFields.map((formField: SocialFormField) => (
                            <FormField
                                key={formField.name}
                                control={form.control}
                                name={formField.name}
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-3">
                                    <formField.icon size={30}/>
                                    <FormControl>
                                        <Input 
                                            className="border-2 border-slate-300 focus:border-none" 
                                            placeholder={formField.placeholder} 
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 text-[10px]"/>
                                </FormItem>
                                )}
                            />
                        ))}
                        </div>
                    </div>
                </div>
                <div className="w-full space-y-5">
                    <WebInterfaceCarousel
                        title = "Manager" 
                        formFields={managerFormFields}
                        data={managerData}
                        setData={setManagerData}
                        avatarFileRef={managerAvatarFileRef}
                        handleImageFileChange={handleManagerImageFileChange}
                        handleAddUpdate={handleAddUpdateManager}
                        handleDelete={handleDeleteManager}
                        dialog={managerDialog}
                        setDialog={setManagerDialog}
                        form={form}
                        itemName={"managers"}
                        onOpenChange={() => setManagerData({name: "", position: "", image: ""})}
                    />
                </div>
                <div className="w-full space-y-5">
                    <WebInterfaceCarousel
                        title = "Banner" 
                        formFields={bannerFormFields}
                        data={bannerData}
                        setData={setBannerData}
                        avatarFileRef={bannerImageFileRef}
                        handleImageFileChange={handleBannerImageFileChange}
                        handleAddUpdate={handleAddUpdateBanner}
                        handleDelete={handleDeleteBanner}
                        dialog={bannerDialog}
                        setDialog={setBannerDialog}
                        form={form}
                        itemName={"banners"}
                        onOpenChange={() => setBannerData({image: "", link: ""})}
                    />
                </div>                   
                <div className="w-full flex flex-row justify-end">
                    <Button 
                        type="submit" 
                        className="p-5 text-lg bg-red-500 hover:bg-red-200 text-white font-[500] rounded-xl"
                        disabled={isUpdating}
                    >
                        {isUpdating ? <AiOutlineLoading3Quarters className="animate-spin text-black" /> : "Save"}
                    </Button>
                </div>
            </form>
        </Form>
        </div>
    )
}
