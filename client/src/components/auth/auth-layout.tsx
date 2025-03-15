import { Outlet } from 'react-router-dom'
import authSideImg from '@/assets/images/auth-side-img.png'
export default function AuthLayout() {
  return (
    <div className='w-screen h-screen flex flex-row items-center justify-around'>
        <img src={authSideImg} alt='auth-Side-Img' className='h-5/6 rounded-xl'/>
        <div className='w-1/4'>
          <Outlet />
        </div>
    </div>
  )
}
