'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export function ProfileForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setMessage('Profil uspešno ažuriran!');
        // Ažuriraj lokalni state korisnika (treba implementirati u useAuth)
        // updateUser(data.data);
      } else {
        setMessage(data.error || 'Greška');
      }
    } catch (err) {
      setMessage('Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ime"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        />
        <Input
          label="Prezime"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        />
      </div>
      <Input
        label="Telefon"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
      />

      {message && (
        <p className={`text-sm ${message.includes('uspešno') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <Button type="submit" isLoading={isLoading}>Sačuvaj izmene</Button>
    </form>
  );
}
