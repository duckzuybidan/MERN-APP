import AuthForm, { AuthFormField } from '@/components/auth/auth-form'
import OAuth from '@/components/auth/oauth'
import { signUpSchema } from '@/schema'
import { signUp } from '@/store/auth-slice'
import { AppDispatch, RootState } from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import * as z from 'zod'


const formFields : AuthFormField[] = [
  {name: 'username', placeholder: 'Username...'},
  {name: 'email', placeholder: 'Email...'},
  {name: 'password', placeholder: 'Password...'},
]
export default function SignUpPage() {
  const { isUpdating } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>()
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  })
  const onSubmit = (data: z.infer<typeof signUpSchema>) => {
    dispatch(signUp(data)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message, {
          duration: Infinity
        })
      }
      else {
        toast.error(res.payload.message)
      }
    })
  }
  return (
    <>
    <h1 className='w-full text-3xl font-semibold text-center mb-5'>Create an account</h1>
    <AuthForm 
      form={form}
      onSubmit={onSubmit}
      formFields={formFields}
      isLoading={isUpdating}
    />
    <OAuth />
    <p className='mt-5'>Already have an account? 
      <Link to="/sign-in" className="ml-1 underline underline-offset-2 font-bold">Sign in</Link>
    </p>
    </>
  )
}
