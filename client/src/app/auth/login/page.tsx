import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | FunMaker',
  description: 'Sign in to your FunMaker account and start betting with virtual points',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          {/* You can add your logo here */}
          <h1 className="text-3xl font-bold text-blue-600">FunMaker</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 