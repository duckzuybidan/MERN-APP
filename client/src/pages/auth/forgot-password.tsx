import AuthForm, { AuthFormField } from "@/components/auth/auth-form"
import { forgotPasswordSchema } from "@/schema";
import { forgotPassword } from "@/store/auth-slice";
import { AppDispatch, RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const formFields : AuthFormField[] = [
    {name: 'email', placeholder: 'Email...'},
]
export default function ForgotPassword() {
    const { isUpdating } = useSelector(
        (state: RootState) => state.auth
      );
      const dispatch = useDispatch<AppDispatch>()
      const form = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
          email: '',
        }
      })
      const onSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
        dispatch(forgotPassword(data)).then((res) => {
          if(res.payload.success) {
            toast.success(res.payload.message)
          }
          else {
            toast.error(res.payload.message)
          }
        })
      }
    return (
      <>
        <h1 className='w-full text-3xl font-semibold text-center mb-5'>Forgot Password?</h1>
        <AuthForm
          form={form}
          onSubmit={onSubmit}
          formFields={formFields}
          isLoading={isUpdating}
        />
      </>
    )
}
