'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterForm() {
  const router = useRouter();
  const { register, authState } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    terms: '',
    form: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Redirect to dashboard only when authenticated successfully
  useEffect(() => {
    if (submitted && !authState.loading && !authState.error && authState.user) {
      router.push('/dashboard');
    }
  }, [authState, router, submitted]);

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
    if (email.length > 100) return 'Email is too long (max 100 characters)';
    return '';
  };

  const validateUsername = (username: string): string => {
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 30) return 'Username must be less than 30 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
      confirmPassword: '',
      terms: '',
      form: ''
    };

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'terms') {
      setTermsAccepted(checked);
      // Clear terms error when checkbox is checked
      if (checked && errors.terms) {
        setErrors({ ...errors, terms: '' });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Live validation feedback as user types
      if (errors[name as keyof typeof errors]) {
        // Validate the field that's being changed
        let fieldError = '';
        if (name === 'email') fieldError = validateEmail(value);
        else if (name === 'username') fieldError = validateUsername(value);
        else if (name === 'password') fieldError = validatePassword(value);
        else if (name === 'confirmPassword') {
          if (!value) fieldError = 'Please confirm your password';
          else if (formData.password !== value) fieldError = 'Passwords do not match';
        }
        
        setErrors({
          ...errors,
          [name]: fieldError,
        });
      }
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
    
    // Only set submitted to true if validation passes
    setSubmitted(true);
    
    try {
      await register({
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
      });
      
      // Navigation is handled in the useEffect
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        ...errors,
        form: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join FunMaker and start your virtual betting journey
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
            label="Email"
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            fullWidth
            required
          />
          <Input
            label="Username"
            type="text"
            id="username"
            name="username"
            placeholder="johnsmith"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
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
          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            fullWidth
            required
          />
          
          <div className="flex items-start mt-1">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
            </div>
            <div className="ml-2">
              <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
              {errors.terms && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.terms}</p>
              )}
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            <p>Password must:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li className={formData.password.length >= 8 ? 'text-green-500' : ''}>Be at least 8 characters long</li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-500' : ''}>Include an uppercase letter</li>
              <li className={/[a-z]/.test(formData.password) ? 'text-green-500' : ''}>Include a lowercase letter</li>
              <li className={/[0-9]/.test(formData.password) ? 'text-green-500' : ''}>Include a number</li>
              <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : ''}>Include a special character</li>
            </ul>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={authState.loading}
            disabled={authState.loading}
            className="mt-6"
          >
            Create Account
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 