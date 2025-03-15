import { MdAdminPanelSettings, MdOutlineEventAvailable, MdOutlineCategory } from "react-icons/md";
import { Separator } from "../ui/separator";
import { IconType } from "react-icons/lib";
import { AiOutlineProduct } from "react-icons/ai";
import { Link } from "react-router-dom";
import { CiCircleInfo } from "react-icons/ci";
import { MdAccountCircle } from "react-icons/md";
import { BsFillCartCheckFill } from "react-icons/bs";
type SideBarItem = {
    name: string,
    icon: IconType,
    to: string
}
const sideBarItems: SideBarItem[] = [
    {name: "Products", icon: AiOutlineProduct, to: "/admin/products"},
    {name: "Categories", icon:MdOutlineCategory , to: "/admin/categories"},
    {name: "Orders", icon: BsFillCartCheckFill, to: "/admin/orders"},
    {name: "Event Management", icon: MdOutlineEventAvailable, to: "/admin/events-management"},
    {name: "Web Interface", icon: CiCircleInfo, to: "/admin/web-interface"},
    {name: "Account", icon: MdAccountCircle, to: "/admin/account"},
    
]
export default function Sidebar() {
  return (
    <div className="w-1/5 flex flex-col items-center gap-2 shadow-2xl p-3">
        <div className="flex flex-row items-center gap-2">
            <MdAdminPanelSettings size={50}/>
            <h1 className="text-3xl font-bold text-blue-800">Admin Panel</h1>
        </div>
        <Separator className="w-full h-[1px] bg-slate-300"/>
        {sideBarItems.map((item) => (
            <Link 
                key={item.name}  
                to={item.to} 
                className="flex flex-row items-center gap-2 w-full hover:bg-slate-200 p-2 rounded-md"
            >
                <item.icon size={30}/>
                <h1 className="text-xl font-bold">{item.name}</h1>
            </Link>
        ))}
    </div>
  )
}
