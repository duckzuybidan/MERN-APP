
import * as z from "zod";

export const signUpSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(1, { message: 'Password is required' }),
})

export const signInSchema = z.object({
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(1, { message: 'Password is required' }),
})

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Invalid email' }),
})
export const addressSchema = z.object({
    id: z.string(),
    lat: z.number(),
    lng: z.number(),
    houseNumber: z.string().optional(),
    road: z.string().optional(),
    suburb: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postcode: z.string().optional(),
})
export type User = {
    id: string
    username: string
    email: string
    role: "USER" | "ADMIN"
    avatar: string
    phone?: string
    addresses?: z.infer<typeof addressSchema>[]
}

export const resetPasswordSchema = z.object({
    newPassword: z.string().min(1, { message: 'New password is required' }),
    confirmPassword: z.string().min(1, { message: 'Confirm password is required' }),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
})

export const contactSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email" }),
    phone: z.string().min(1, { message: "Phone is required" }),
    message: z.string().min(1, { message: "Message is required" }),
})

export const profileSchema = z.object({
    id: z.string(),
    username: z.string().min(1, { message: "Username is required" }),
    email: z.string().email({ message: "Invalid email" }),
    phone: z.string().optional(),
    avatar: z.string(),
    addresses: z.array(addressSchema)
})

export const webInterfaceSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    about: z.string().min(1, { message: "About is required" }),
    contact: z.object({
        phone: z.string().min(1, { message: "Phone is required" }),
        email: z.string().email({ message: "Invalid email" }),
        address: z.string().min(1, { message: "Address is required" }),
        social: z.object({
            Facebook: z.string(),
            Instagram: z.string(),
            Twitter: z.string(),
            Youtube: z.string(),
        }),
    }),
    managers: z.array(z.object({
        image: z.string().min(1, { message: "Image is required" }),
        name: z.string().min(1, { message: "Name is required" }),
        position: z.string().min(1, { message: "Position is required" }),
    })),
    banners: z.array(z.object({
        image: z.string().min(1, { message: "Image is required" }),
        link: z.string().min(1, { message: "Link is required" }),
    })),
})

export const categoryWithoutChildrenSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: "Name is required" }),
    image: z.string().min(1, { message: "Image is required" }),
    parentId: z.string()
})
export const categorySchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: "Name is required" }),
    image: z.string().min(1, { message: "Image is required" }),
    parentId: z.string(),
    children: z.array(categoryWithoutChildrenSchema)
}).refine(data => !data.name.includes("/"), {
    message: "Name must not contain /",
    path: ["name"]
})
export const productVariantSchema = z.object({
    id: z.string(),
    productId: z.string(),
    name: z.string().min(1, { message: "Name is required" }),
    image: z.string().min(1, { message: "Image is required" }),
    price: z.string(),
    inStock: z.string(),
    discountPrice: z.string().nullable(),
    discountExpiry: z.string().nullable(),
}).refine(data => parseFloat(data.price) > 0, {
    message: "Price must be greater than 0",
    path: ["price"]
}).refine(data => parseFloat(data.inStock) > 0, {
    message: "In stock must be greater than 0",
    path: ["inStock"]
}).refine(data => data.discountPrice === null || data.discountPrice === "" || parseFloat(data.discountPrice) >= 0, {
    message: "Discount price must be greater than or equal to 0",
    path: ["discountPrice"]
}).refine(data => data.discountPrice === null || data.discountPrice === "" || parseFloat(data.discountPrice) <= parseFloat(data.price), {
    message: "Discount price must be less than or equal to price",
    path: ["discountPrice"]
})


export const productSchema = z.object({
    id: z.string(),
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().min(1, { message: "Description is required" }),
    displayImages: z.array(z.string()),
    categoryId: z.string().min(1, { message: "Category is required" }),
    variants: z.array(productVariantSchema),
    eventIds: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type ProductWithPage = {
    products: z.infer<typeof productSchema>[]
    page: number
    query: string,
    filterCategory: string,
    priceOrder: "asc" | "desc" | "none",
    priceMin: number,
    priceMax: number,
    updatedAtOrder: "asc" | "desc" | "none",
}

export const eventSchema = z.object({
    id: z.string(),
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().min(1, { message: "Description is required" }),
    isActive: z.boolean(),
    expiresAt: z.string(),
    productIds : z.array(z.string()),
    products: z.array(productSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const CartItemSchema = z.object({
    id: z.string(),
    item: productVariantSchema,
    itemId: z.string(),
    quantity: z.string(),
    phone: z.string().min(1, { message: "Phone is required" }),
    addressId: z.string().min(1, { message: "Address is required" }),
    address: addressSchema,
    price: z.string(),
    status: z.enum(["UNVERIFIED", "VERIFIED", "SHIPPED"]),
    paymentMethod: z.enum(["CASH_ON_DELIVERY"]),
    createdAt: z.string(),
    updatedAt: z.string(),
})
export const CartSchema = z.object({
    id: z.string(),
    userId: z.string(),
    cartItems: z.array(CartItemSchema),
})