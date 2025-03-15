import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { getAllAdminEmails } from "@/store/admin-slice/others";
import { useEffect } from "react";
import { getAllOrders } from "@/store/admin-slice/order";

export default function AdminLayout() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getAllAdminEmails())
    dispatch(getAllOrders())
  },[dispatch])
  return (
    <div className="w-screen min-h-screen flex flex-row h-max">
        <Sidebar />
        <Outlet />
    </div>
  )
}
