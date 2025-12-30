import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SignInProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  compact?: boolean;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onSignUp, onForgotPassword, compact = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (res.ok) {
         // Simulate a small delay (e.g. 500ms) to show spinner (you can remove or adjust this if the API is fast)
         await new Promise(resolve => setTimeout(resolve, 500));
         if (onSignIn) onSignIn();
         router.push('/dashboard');
      } else {
         const data = await res.json();
         setError(data?.error || 'Invalid email or password');
      }
    } catch (err) {
       setError('An error occurred. Please try again.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <img src="/OIP.jpeg" alt="Welcome" width={112} height={112} className="w-24 sm:w-28 h-24 sm:h-28 object-cover rounded-full shadow-md mb-4 sm:mb-6 border-2 border-indigo-200 dark:border-indigo-800" style={{ marginTop: '-1.5rem' }} />
      <div className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 lg:p-10 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 sm:mb-4">Welcome Back</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-center">Sign in to your account</p>
        {error && <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mb-4 sm:mb-6 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 sm:gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 text-sm sm:text-base"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 text-sm sm:text-base flex items-center justify-center"
          >
            {isLoading ? (
              <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "Sign In"}
          </button>
        </form>
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center w-full text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <button onClick={onForgotPassword} className="hover:underline">Forgot Password?</button>
          <button onClick={onSignUp} className="hover:underline">Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 