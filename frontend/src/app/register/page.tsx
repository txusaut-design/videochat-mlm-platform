// src/app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { VideoCameraIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'username must be at least 3 characters')
    .max(50, 'username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  walletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
  referralCode: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Set referral code from URL parameter
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setValue('referralCode', ref);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const { confirmPassword, acceptTerms, ...registerData } = data;
      
      const response = await authApi.register(registerData);
      
      setUser(response.user);
      setToken(response.token);
      
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <VideoCameraIcon className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold gradient-text">VideoChat MLM</span>
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-slate-400">Join our premium video chat platform</p>
          </div>

          {/* Registration Form */}
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="username"
                  placeholder="Choose a username"
                  {...register('username')}
                  error={errors.username?.message}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name (Optional)"
                  placeholder="Your first name"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />

                <Input
                  label="Last Name (Optional)"
                  placeholder="Your last name"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>

              <Input
                label="Wallet Address"
                placeholder="0x... (Polygon/Ethereum address)"
                {...register('walletAddress')}
                error={errors.walletAddress?.message}
                helperText="Your Polygon wallet address to receive USDC payments"
              />

              <Input
                label="Referral Code (Optional)"
                placeholder="Enter referral username"
                {...register('referralCode')}
                error={errors.referralCode?.message}
                helperText="Get referred by an existing member to join their network"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-300"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="mt-1 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500"
                />
                <div className="text-sm">
                  <label className="text-slate-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-400 hover:text-primary-300">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-400 hover:text-primary-300">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-red-400">{errors.acceptTerms.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                loading={isLoading}
                className="w-full"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-400 hover:text-primary-300">
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}