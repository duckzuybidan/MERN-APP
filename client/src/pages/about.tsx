import aboutSideImg from '@/assets/images/about-side-img.jpg'
import { RiCustomerService2Line } from "react-icons/ri";
import { IconType } from 'react-icons/lib';
import { FaShippingFast } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type Manager = {
  image: string
  name: string
  position: string
}
type Service = {
  icon: IconType
  description: string
  subdescription: string
}
const services: Service[] = [
  {icon: FaShippingFast, description: "Free And Fast Delivery", subdescription: "Free delivery for all orders"},
  {icon: RiCustomerService2Line, description: "24/7 Customer Service", subdescription: "Friendly 24/7 customer support"},
  {icon: MdSecurity, description: "Money Back Guarantee", subdescription: "We return money within 30 days"}
]
export default function About() {
  const location = useLocation()
  const {webInterfaceData} = useSelector((state: RootState) => state.webInterface)
  useEffect(() => {
    scrollTo(0, 0)
  }, [location.pathname])
  return (
    <div className="w-full h-full flex flex-col items-center gap-10">
      <div className="w-full flex flex-row justify-around items-center mt-[100px]">
        <div className='w-1/3'>
          <h1 className='text-4xl font-bold mb-5'>About</h1>
          <p className='text-lg'>
            {webInterfaceData?.about}
          </p>
        </div>
        <div>
          <img src={aboutSideImg} alt="about-side-img" className="scale-75 rounded-xl"/>
        </div>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="h-[400px] aspect-[6/4]"
      >
        <CarouselContent>
          {webInterfaceData?.managers.map((manager: Manager) => (
              <CarouselItem key={manager.name} className='flex flex-col gap-2 basis-1/2'>
                <img 
                  src={manager.image} 
                  alt={manager.name} 
                  className='rounded-xl w-full h-full object-cover'
                  loading='lazy'
                />
                <div>
                  <h1 className='text-xl font-semibold'>{manager.name}</h1>
                  <p>{manager.position}</p>
                </div>
              </CarouselItem>
          ))}
        </CarouselContent>
          <CarouselNext className='bg-black text-white'/>
          <CarouselPrevious className='bg-black text-white'/>
      </Carousel>
      <div className='w-3/4 flex flex-row items-center justify-around'>
        {services.map((service: Service) => (
          <div key={service.description} className='w-[250px] h-[250px] flex flex-col justify-center items-center gap-2'>
            <div className='flex justify-center items-center p-3 bg-black rounded-full shadow-lg'>
              <service.icon color='white' size={30}/>
            </div>
            <h1 className='text-xl font-semibold'>{service.description.toUpperCase()}</h1>
            <p>{service.subdescription}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
