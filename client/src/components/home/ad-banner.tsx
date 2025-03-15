import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
export default function AdBanner() {
    const { webInterfaceData } = useSelector((state: RootState) => state.webInterface)
    return (
        <div>
        <Carousel
            opts={{
                loop: true,
                align: "center",
            }}
            className="h-[500px] aspect-[16/9]"
        > 
            <CarouselContent>
                {webInterfaceData?.banners.map((banner) => (
                    <CarouselItem key={banner.link} className="hover:cursor-pointer" onClick={() => window.open(banner.link, "_blank")}>
                    <img
                        src={banner.image}
                        alt={banner.link}
                        className="w-full h-full object-cover"
                        loading='lazy'
                    />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className='bg-black text-white'/>
            <CarouselNext className='bg-black text-white'/>
        </Carousel>
        </div>
    )
}
