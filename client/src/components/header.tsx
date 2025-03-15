import { FaShopify } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "./user/user-menu";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ProductSearchbar from "./custom/product-searchbar";
type HeaderItem = {
    name: string,
    link: string
}
const headerItems: HeaderItem[] = [
    {name: "Contact", link: "/contact"},
    {name: "About", link: "/about"},
    {name: "Product", link: "/product"},
]
export default function Header() {
    const location = useLocation();
    const {isAuthenticated, user} = useSelector((state: RootState) => state.auth);
    const {webInterfaceData} = useSelector((state: RootState) => state.webInterface)
    if(isAuthenticated && user?.role == 'ADMIN') return null
    return (
        <div className="flex flex-row items-center justify-around w-screen h-[96px] bg-white p-3 border-b border-slate-300">
            <Link className="flex flex-row items-center gap-2" to="/">
                <FaShopify size={50}/>
                <h1 className="text-3xl font-semibold">{webInterfaceData?.name}</h1>
            </Link>
            <div className="flex flex-row items-center gap-5">
                {headerItems.map((item) => (
                    <Link key={item.name} className={`text-xl font-semibold ${location.pathname.includes(item.link) ? "underline underline-offset-2" : ""}`} to={item.link}>{item.name}</Link>
                ))}
            </div>
            <div className="w-[400px] h-full">
                <ProductSearchbar/>
            </div>
            <div className="flex items-center">
                <UserMenu />
            </div>
        </div>
    )
}
