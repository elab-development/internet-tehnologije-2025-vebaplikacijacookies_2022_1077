// app/(auth)/login/page.tsx

'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();

  // Redirect URL nakon prijave
  const redirectUrl = searchParams.get('redirect') || '/';

  // ==========================================
  // STATE
  // ==========================================

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  // ==========================================
  // VALIDACIJA
  // ==========================================

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
      general: '',
    };

    // Email validacija
    if (!formData.email) {
      newErrors.email = 'Email je obavezan';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nevažeći format email adrese';
    }

    // Lozinka validacija
    if (!formData.password) {
      newErrors.password = 'Lozinka je obavezna';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Lozinka mora imati najmanje 8 karaktera';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Resetuj opštu grešku
    setErrors((prev) => ({ ...prev, general: '' }));

    // Validacija
    if (!validateForm()) {
      return;
    }

    // Poziv login funkcije
    const result = await login(formData.email, formData.password, formData.rememberMe);

    if (result.success) {
      // Uspešna prijava - preusmeri
      router.push(redirectUrl);
    } else {
      // Neuspešna prijava - prikaži grešku
      setErrors((prev) => ({
        ...prev,
        general: result.error || 'Došlo je do greške pri prijavi',
      }));
    }
  };

  // ==========================================
  // INPUT HANDLERS
  // ==========================================

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Očisti grešku za to polje
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Naslov */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cookie Commerce
          </h1>
          <p className="text-gray-600">Prijavite se na svoj nalog</p>
        </div>

        {/* Login Card */}
        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">Prijava</h2>
            </CardHeader>

            <CardBody className="space-y-4">
              {/* Opšta greška */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errors.general}</span>
                  </div>
                </div>
              )}

              {/* Email */}
              <Input
                label="Email adresa"
                type="email"
                placeholder="primer@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                required
                autoComplete="email"
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
              />

              {/* Lozinka */}
              <Input
                label="Lozinka"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                required
                autoComplete="current-password"
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Zapamti me</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Zaboravili ste lozinku?
                </Link>
              </div>
            </CardBody>

            <CardFooter className="space-y-4">
              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
              </Button>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ili</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-gray-600">Nemate nalog? </span>
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Registrujte se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Test Credentials */}
        {process.env.NODE_ENV === 'development' && (
          <Card variant="bordered" padding="md" className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Test kredencijali:
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>👤 Customer: customer@example.com / password123</p>
              <p>🛡 Admin: admin@cookiecommerce.com / password123</p>
              <p>⚙ Moderator: moderator@cookiecommerce.com / password123</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}