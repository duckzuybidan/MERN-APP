import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandList,
} from "@/components/ui/command";
import { productSchema } from "@/schema";
import { useState, useEffect } from "react";
import { z } from "zod";
import { CiSearch } from "react-icons/ci";
import { Button } from "../ui/button";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { cacheSearchProducts } from "@/store/admin-slice/product";
import ProductFilterPopover from "./product-filter-popover";

export default function ProductSearchbar() {
    const dispatch = useDispatch<AppDispatch>();
    const {cachedSearchProducts} = useSelector((state: RootState) => state.product)
    const [searchParams, setSearchParams] = useSearchParams();
    const [value, setValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [searchProducts, setSearchProducts] = useState<z.infer<typeof productSchema>[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const handleChange = (value: string) => {
        setValue(value);
        setIsOpen(true);
    };

    const handleSearch = () => {
        setIsOpen(false);
        searchParams.set("query", value);
        searchParams.set("page", "1");
        setSearchParams(searchParams);
        if(!location.pathname.includes('admin')){
            navigate(`/product?${searchParams.toString()}`)
        }
    };
    const highlightTitle = (title: string) => {
    if (!value) return title;
    const regex = new RegExp(`(${value})`, "gi");
    return title.replace(regex, (match) => `<span class=" bg-sky-300">${match}</span>`);
}
    useEffect(() => {
        const queryValue = searchParams.get("query");
        if (queryValue) {
            setValue(decodeURIComponent(queryValue));
        }
    }, [searchParams.get("query")]);
    useEffect(() => {
        if (!value) {
            setSearchProducts([]);
            return;
        }
        const cachedProducts = cachedSearchProducts.find((product) => product.key === value);
        if (cachedProducts) {
            setSearchProducts(cachedProducts.products);
            return;
        }
        const fetchSearchProducts = async () => {
            try {
                const products = await axios.get(
                    `/api/admin/get-all-products?page=1&limit=5&query=${value}`
                ).then((res) => res.data.products.products as z.infer<typeof productSchema>[])
                .catch ((err) => {
                    throw new Error(err.response.data)
                })
                dispatch(cacheSearchProducts({key: value, products}))
                setSearchProducts(products);
            } catch (error) {
                console.error(error);
            }
        }
        fetchSearchProducts();
    }, [value]);
    return (
        <div className="relative z-30 min-h-[100px]">
            <Command className="absolute w-full h-min bg-slate-200 rounded-md p-2">
                <CommandInput
                    className="w-[70%]"
                    value={value}
                    onValueChange={handleChange}
                    placeholder="Search..."
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setIsOpen(false)}
                    onKeyDown={(e: any) => e.key === "Enter" && handleSearch()}
                />
                <Button className="p-0 absolute top-3 right-[25%]" onClick={handleSearch}>
                    <CiSearch size={30} />
                </Button>
                <div className="p-0 absolute top-3 right-[5%]">
                    <ProductFilterPopover />
                </div>
                <div className="bg-white w-full h-[1px]" />
                <CommandList
                    className={`bg-white rounded-md transition-all duration-300 overflow-auto 
                        ${isOpen ? "opacity-100 scale-100 max-h-60" : "opacity-0 scale-95 max-h-0"}`
                    }
                >
                    {searchProducts.length > 0 ? (
                        searchProducts.map((product: z.infer<typeof productSchema>, index: number) => (
                            <div
                                key={index}
                                className="w-full hover:bg-sky-100 border-b p-3 cursor-pointer"
                                onClick={() => setValue(product.title.trim())}
                            >
                                <div className="flex flex-row items-center gap-2">
                                    <img
                                        src={product.displayImages[0]}
                                        alt={product.title}
                                        className="w-10 h-10 object-cover rounded-md"
                                    />
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                product.title.length > 20
                                                    ? highlightTitle(product.title.slice(0, 20)) + "..."
                                                    : highlightTitle(product.title),
                                        }}
                                    ></span>

                                </div>
                            </div>
                        ))
                    ) : (
                        <CommandEmpty>No products match your search.</CommandEmpty>
                    )}
                </CommandList>
            </Command>
        </div>
    );
}
