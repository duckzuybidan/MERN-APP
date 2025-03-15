import GoogleIcon from '@/assets/icons/google.svg'
import { Button } from '../ui/button'
import { useDispatch } from 'react-redux';
import { AppDispatch} from '@/store/store';
import { oAuth } from '@/store/auth-slice';
import { useState } from 'react';
import { toast } from 'sonner';
export default function OAuth() {
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const handleOAuth = () => {
        setIsLoading(true)
        dispatch(oAuth()).then((res) => {
            setIsLoading(false)
            if(res.payload.success) {
                window.location.href = res.payload.url
            }
            else {
                toast.error(res.payload.message)
            }
        })
    }
    return (
        <Button
            type='button'
            className="w-full bg-slate-500 hover:bg-slate-300 text-white font-[500] rounded-xl mt-4"
            onClick={handleOAuth}
            disabled={isLoading}
        >
            <img src={GoogleIcon} alt="Google Icon" className="w-5 h-5 rounded-full mr-2"/>
            Continue with Google
        </Button>
    )
}
