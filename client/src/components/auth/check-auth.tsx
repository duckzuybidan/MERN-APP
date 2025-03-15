import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function CheckAuth({
    children
}: {
    children: React.ReactNode
}) {
    const location = useLocation();
    const {isAuthenticated, user} = useSelector((state: RootState) => state.auth);
    if(isAuthenticated && (location.pathname.includes('sign-up') || location.pathname.includes('sign-in'))) {
        if(user?.role === 'ADMIN') {
            return <Navigate to="/admin/products" />
        }
        return <Navigate to="/" />
    }
    if(isAuthenticated){
        if(user?.role === 'ADMIN' && !location.pathname.includes('admin')) {
            return <Navigate to="/admin/products" />
        }
        if(user?.role === 'USER' && location.pathname.includes('admin')) {
            return <Navigate to="/" />
        }
    }
    if(!isAuthenticated && (location.pathname.includes('user') || location.pathname.includes('admin'))) {
        return <Navigate to="/sign-in" />
    }
    return (
        <>{children}</>
    )
}
