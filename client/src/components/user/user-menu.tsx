import { AppDispatch, RootState } from "@/store/store"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VscSignOut } from "react-icons/vsc";
import { IconType } from "react-icons/lib";
import { signOut } from "@/store/auth-slice";
import { toast } from "sonner";
import { CgProfile } from "react-icons/cg";
import { RiShoppingCartLine } from "react-icons/ri";
type MenuItem = {
    icon: IconType
    text: string
    to: string
}
const menuItems: MenuItem[] = [
    {icon: CgProfile, text: "Profile", to: "/user/profile"},
    {icon: RiShoppingCartLine, text: "Cart", to: "/user/cart"},
]
export default function UserMenu() {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user } = useSelector(
        (state: RootState) => state.auth
    );
    const handleSignOut = () => {
        dispatch(signOut()).then((res) => {
            if(res.payload.success) {
                toast.success(res.payload.message)
            }
        });
    }
    if(!isAuthenticated){
        return (
            <Link
                className={`text-xl font-semibold ${location.pathname.includes("sign-in") ? "underline underline-offset-2" : ""}`} 
                to="/sign-in"
            >
                Sign In
            </Link>
        )
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="flex flex-row gap-2 items-center">
                    <img
                        src={user?.avatar}
                        alt="Avatar"
                        className="w-11 h-11 rounded-full object-cover"
                    />
                    <span>{user?.username}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-100 p-2 min-w-[150px]">
                <DropdownMenuLabel className="text-lg">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black"/>
                {menuItems.map((item) => (
                    <Link key={item.text} to={item.to}>
                    <DropdownMenuItem
                        className="flex flex-row gap-2 items-center hover:cursor-pointer hover:bg-slate-300 rounded-md" 
                    >
                        <span className="font-semibold">{item.text}</span>
                        <item.icon size={20} color="black"/>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-black"/>
                    </Link>
                ))}
                <DropdownMenuItem
                    className="flex flex-row gap-2 items-center hover:cursor-pointer hover:bg-slate-300 rounded-md" 
                    onClick={handleSignOut}
                 >
                    <span className="font-semibold">Sign Out</span>
                    <VscSignOut size={20} color="red"/>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}
