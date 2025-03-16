'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const router = useRouter();
  const { login, authState } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    identifier: '',
    password: '',
    form: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Redirect only when authenticated successfully
  useEffect(() => {
    if (submitted && !authState.loading && !authState.error && authState.user) {
      router.push('/dashboard');
    }
  }, [authState, router, submitted]);

  const validateIdentifier = (identifier: string): string => {
    if (!identifier.trim()) return 'Email or username is required';
    // Simple check for minimum length
    if (identifier.trim().length < 3) return 'Email or username must be at least 3 characters';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateForm = () => {
    const newErrors = { 
      identifier: validateIdentifier(formData.identifier),
      password: validatePassword(formData.password),
      form: ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Live validation feedback
    if (errors[name as keyof typeof errors]) {
      let fieldError = '';
      if (name === 'identifier') fieldError = validateIdentifier(value);
      else if (name === 'password') fieldError = validatePassword(value);
      
      setErrors({
        ...errors,
        [name]: fieldError,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset form-level error
    setErrors({ ...errors, form: '' });
    
    // First validate the form
    if (!validateForm()) {
      return; // Don't proceed if validation fails
    }
    
    try {
      console.log('Submitting login form with identifier:', formData.identifier.trim());
      
      // Only set submitted to true if validation passes
      setSubmitted(true);
      
      await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });
      
      console.log('Login request completed - waiting for redirect');
      // Navigation is handled in the useEffect
    } catch (error) {
      console.error('Login submission error:', error);
      
      setErrors({
        ...errors,
        form: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
      
      // Reset submitted state to allow retrying
      setSubmitted(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign in to your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your credentials to access your account
          </p>
        </div>
        
        {/* Display server-side errors or form-level errors */}
        {(authState.error || errors.form) && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded border border-red-200 dark:border-red-900/30">
            {authState.error || errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Username"
            type="text"
            id="identifier"
            name="identifier"
            placeholder="you@example.com or your username"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
            fullWidth
            required
          />
          <Input
            label="Password"
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            fullWidth
            required
          />
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={authState.loading}
            disabled={authState.loading}
            className="mt-6"
          >
            Sign in
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 