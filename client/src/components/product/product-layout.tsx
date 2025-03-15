import { Outlet } from "react-router-dom";


export default function ProductLayout() {
  return (
    <div className="w-screen min-h-screen flex flex-row h-max">
      <Outlet />
    </div>
  )
}
