import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | FunMaker',
  description: 'Create a new FunMaker account and start betting with virtual points',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          {/* You can add your logo here */}
          <h1 className="text-3xl font-bold text-blue-600">FunMaker</h1>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
