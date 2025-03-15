import AuthForm, { AuthFormField } from '@/components/auth/auth-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema } from '@/schema'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import * as z from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { signIn,resendEmailVerification } from '@/store/auth-slice'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCountdown } from 'usehooks-ts'
import OAuth from '@/components/auth/oauth'

const formFields : AuthFormField[] = [
  {name: 'email', placeholder: 'Email...'},
  {name: 'password', placeholder: 'Password...'},
]
export default function SignInPage() {
  const countdown = 60
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: countdown,
      intervalMs: 1000,
    })
  const [resendVerification, setResendVerification] = useState({
    needVerification: false,
    email: ''
  })
  const { isUpdating } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>()
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  })
  const handleResendEmailVerification = (email: string) => {
    dispatch(resendEmailVerification(email)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
        startCountdown()
      }
      else {
        toast.error(res.payload.message)
      }
    })
  }
  const onSubmit = (data: z.infer<typeof signInSchema>) => {
    dispatch(signIn(data)).then((res) => {
      if(res.payload.success) {
        toast.success(res.payload.message)
      }
      else {
        setResendVerification({
          needVerification: res.payload.needVerification || false,
          email: data.email
        })
        toast.error(res.payload.message)
      }
    })
  }
  useEffect(() => {
    if(count === 0) {
      stopCountdown()
      resetCountdown()
      setResendVerification({
        needVerification: false,
        email: ''
      })
    }
  }, [count, stopCountdown, resetCountdown])
  
  return (
    <div className='flex flex-col gap-2'>
    <h1 className='w-full text-3xl font-semibold text-center mb-5'>Sign in</h1>
    <AuthForm 
      form={form}
      onSubmit={onSubmit}
      formFields={formFields}
      isLoading={isUpdating}
    />
    <OAuth />
    <p className='mt-5'> Don't have an account? 
      <Link to="/sign-up" className="ml-1 underline underline-offset-2 font-bold">Sign up</Link>
    </p>
    {resendVerification.needVerification && 
    <Button 
      className='hover:underline p-0 w-min h-min'
      onClick={() => handleResendEmailVerification(resendVerification.email)}
      disabled={count > 0 && count < countdown}
    >
      Resend email verification
      {count > 0 && count < countdown && <span className='ml-2 font-bold'>{count}</span>}
    </Button>
    }
    <Link
      className='hover:underline font-bold'
      to="/forgot-password"
    >
      Forgot password?
    </Link>
    </div>
  )
}

