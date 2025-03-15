import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa6";
export default function Footer() {
  const {isAuthenticated, user} = useSelector((state: RootState) => state.auth);
  const {webInterfaceData} = useSelector((state: RootState) => state.webInterface)
  
  const handleClickSocial = (platform: "Facebook" | "Instagram" | "Twitter" | "Youtube") => {
    window.open(webInterfaceData?.contact.social[platform], '_blank');
  }
  if(isAuthenticated && user?.role == 'ADMIN') return null
  return (
    <div className="flex flex-row py-10 justify-around w-screen min-h-[200px] bg-black">
        <div>
            <h1 className="text-3xl font-semibold text-white">{webInterfaceData?.name}</h1>
            <p className="text-white">Copyright © 2024. All rights reserved.</p>
        </div>
        <div className="flex flex-col gap-3">
            <h1 className="text-3xl text-white font-semibold">Support</h1>
            <p className="text-white text-lg">{webInterfaceData?.contact.address}</p>
            <p className="text-white text-lg">{webInterfaceData?.contact.email}</p>
            <p className="text-white text-lg">{webInterfaceData?.contact.phone}</p>
        </div>
        <div className="flex flex-col gap-3">
            <h1 className="text-3xl text-white font-semibold">Quick Link</h1>
            <Link className="text-white text-lg" to="/">Home</Link>
            <Link className="text-white text-lg" to="/about">About</Link>
            <Link className="text-white text-lg" to="/contact">Contact</Link>
        </div>
        <div className="flex flex-col gap-3">
            <h1 className="text-3xl text-white font-semibold">Social</h1>
            {webInterfaceData?.contact.social.Facebook && 
              <div 
                className="flex flex-row gap-2 items-center text-white text-lg hover:underline hover:cursor-pointer"
                onClick={() => handleClickSocial('Facebook')}
              >
                <FaFacebook size={30} color="white"/>
                Facebook
              </div>
            }
            {webInterfaceData?.contact.social.Instagram && 
              <div 
                className="flex flex-row gap-2 items-center text-white text-lg hover:underline hover:cursor-pointer"
                onClick={() => handleClickSocial('Instagram')}
              >
                <FaInstagram size={30} color="white"/>
                Instagram
              </div>
            }
            {webInterfaceData?.contact.social.Twitter && 
              <div 
                className="text-white text-lg hover:underline hover:cursor-pointer"
                onClick={() => handleClickSocial('Twitter')}
              >
                <FaTwitter size={30} color="white"/>
                Twitter
              </div>
            }
            {webInterfaceData?.contact.social.Youtube && 
              <div 
                className="text-white text-lg hover:underline hover:cursor-pointer"
                onClick={() => handleClickSocial('Youtube')}
              >
                <FaYoutube size={30} color="white"/>
                Youtube
              </div>
            }
        </div>
    </div>
  )
}
