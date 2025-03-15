import AuthForm, { AuthFormField } from "@/components/auth/auth-form"
import { resetPasswordSchema } from "@/schema";
import { resetPassword } from "@/store/auth-slice";
import { AppDispatch, RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const formFields : AuthFormField[] = [
    {name: 'newPassword', placeholder: 'New Password...'},
    {name: 'confirmPassword', placeholder: 'Confirm Password...'},
]

export default function ResetPassword() {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const { isUpdating } = useSelector(
        (state: RootState) => state.auth
    );
    const dispatch = useDispatch<AppDispatch>()
    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
          newPassword: "",
          confirmPassword: "",
        }
    })
    const onSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
        dispatch(resetPassword({token: token!, userId: userId!, password: data.newPassword})).then((res) => {
          if (res.payload.success) {
            toast.success(res.payload.message)
          } else {
            toast.error(res.payload.message)
          }
        })
    }
    return (
      <>
        <h1 className='w-full text-3xl font-semibold text-center mb-5'>Reset Password</h1>
        <AuthForm
          form={form}
          onSubmit={onSubmit}
          formFields={formFields}
          isLoading={isUpdating}
        />
        <p className='mt-5'>
            Back to 
            <Link to="/sign-in" className="ml-1 underline underline-offset-2 font-bold">Sign in</Link>
        </p>
      </>
    )
}
