// app/(auth)/register/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  // ==========================================
  // STATE
  // ==========================================

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: '',
    general: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  // ==========================================
  // VALIDACIJA
  // ==========================================

  const validateForm = (): boolean => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      acceptTerms: '',
      general: '',
    };

    // Ime
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ime je obavezno';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Ime mora imati najmanje 2 karaktera';
    }

    // Prezime
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Prezime je obavezno';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Prezime mora imati najmanje 2 karaktera';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email je obavezan';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nevažeći format email adrese';
    }

    // Telefon (opciono, ali ako je unet mora biti validan)
    if (formData.phoneNumber && !/^\+?[0-9]{9,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Nevažeći format broja telefona';
    }

    // Lozinka
    if (!formData.password) {
      newErrors.password = 'Lozinka je obavezna';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Lozinka mora imati najmanje 8 karaktera';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Lozinka mora sadržati bar jedno veliko slovo';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Lozinka mora sadržati bar jedno malo slovo';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Lozinka mora sadržati bar jedan broj';
    }

    // Potvrda lozinke
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potvrdite lozinku';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Lozinke se ne poklapaju';
    }

    // Uslovi korišćenja
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Morate prihvatiti uslove korišćenja';
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== '');
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Resetuj poruke
    setErrors((prev) => ({ ...prev, general: '' }));
    setSuccessMessage('');

    // Validacija
    if (!validateForm()) {
      return;
    }

    // Poziv register funkcije
    const result = await register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName,
      formData.phoneNumber || undefined
    );

    if (result.success) {
      // Uspešna registracija
      setSuccessMessage(result.message || 'Registracija uspešna! Preusmeravanje na login...');
      
      // Preusmeri na login nakon 2 sekunde
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      // Neuspešna registracija
      setErrors((prev) => ({
        ...prev,
        general: result.error || 'Došlo je do greške pri registraciji',
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
      <div className="w-full max-w-2xl">
        {/* Logo/Naslov */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cookie Commerce
          </h1>
          <p className="text-gray-600">Kreirajte novi nalog</p>
        </div>

        {/* Register Card */}
        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">Registracija</h2>
            </CardHeader>

            <CardBody className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                </div>
              )}

              {/* General Error */}
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

              {/* Ime i Prezime - Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ime"
                  placeholder="Marko"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={errors.firstName}
                  required
                  autoComplete="given-name"
                />

                <Input
                  label="Prezime"
                  placeholder="Marković"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                  required
                  autoComplete="family-name"
                />
              </div>

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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              {/* Telefon */}
              <Input
                label="Broj telefona"
                type="tel"
                placeholder="+381 64 123 4567"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                error={errors.phoneNumber}
                helperText="Opciono"
                autoComplete="tel"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
                autoComplete="new-password"
                helperText="Najmanje 8 karaktera, jedno veliko slovo, jedno malo slovo i jedan broj"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {/* Potvrda lozinke */}
              <Input
                label="Potvrdite lozinku"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              {/* Accept Terms */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Prihvatam{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      uslove korišćenja
                    </Link>{' '}
                    i{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      politiku privatnosti
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-xs text-red-600 mt-1">{errors.acceptTerms}</p>
                )}
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
                disabled={!!successMessage}
              >
                {isLoading ? 'Registracija...' : 'Registruj se'}
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

              {/* Login Link */}
              <div className="text-center">
                <span className="text-gray-600">Već imate nalog? </span>
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Prijavite se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}