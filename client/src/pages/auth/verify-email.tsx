import { verifyEmail } from "@/store/auth-slice";
import { AppDispatch} from "@/store/store";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { FaCircleXmark, FaCircleChevronDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [isReadyVerifyEmail, setIsReadyVerifyEmail] = useState(false);
  const [isVerifyEmailLoading, setIsVerifyEmailLoading] = useState(true);
  useEffect(() => {
    if(!token || !userId) return;
    setIsReadyVerifyEmail(true);
  }, [token, userId]);
  useEffect(() => {
    if (!isReadyVerifyEmail || !token || !userId) return;
    dispatch(verifyEmail({token, userId})).then((res) => {
      setIsVerifiedSuccess(res.payload.success);
      setIsVerifyEmailLoading(false);
    });
    
  }, [isReadyVerifyEmail, dispatch, token, userId]);
  if (isVerifyEmailLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center gap-3">
        <AiOutlineLoading3Quarters className="animate-spin text-black" size={50}/>
        <p>Verifying email...</p>
      </div>
    );
  }
  if(!isVerifyEmailLoading && !isVerifiedSuccess) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="flex flex-col justify-center items-center p-5 bg-red-500 rounded-xl gap-3">
          <FaCircleXmark size={50} className="text-white"/>
          <h1 className="text-white font-bold text-xl">Failed to verify email</h1>
          <Button 
            className="text-black font-bold hover:underline" 
            onClick={() => navigate("/sign-in", {replace: true})}
          >
            Please sign in and resend verification email!
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col justify-center items-center p-5 bg-green-500 rounded-xl gap-3">
        <FaCircleChevronDown size={50} className="text-white"/>
        <h1 className="text-white font-bold text-xl">Email verified successfully</h1>
        <Button 
          className="text-black font-bold hover:underline" 
          onClick={() => navigate("/", {replace: true})}
        >
          Go to home page
        </Button>
      </div>
    </div>
  )
}
