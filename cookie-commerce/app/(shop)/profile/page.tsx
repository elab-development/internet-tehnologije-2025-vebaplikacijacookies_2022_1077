'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Button } from '@/components/ui/Button';
// Ovde bi išli importi za AddressManager i PreferencesForm (ostavićemo placeholder za sada)

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) return <div className="p-8 text-center">Učitavanje...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  const tabs = [
    { id: 'profile', label: 'Lični podaci' },
    { id: 'addresses', label: 'Adrese' },
    { id: 'orders', label: 'Istorija narudžbina' },
    { id: 'settings', label: 'Podešavanja' },
    { id: 'privacy', label: 'Privatnost (GDPR)' },
  ];

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/user/export-data');
      const data = await res.json();

      if (data.success) {
        // Kreiraj Blob i link za download
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cookie-commerce-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Greška pri izvozu podataka');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('DA LI STE SIGURNI? Ovo će trajno obrisati vaš nalog i sve podatke. Nema povratka!')) return;

    try {
      setIsDeleting(true);
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        alert('Vaš nalog je obrisan. Hvala što ste bili sa nama.');
        window.location.href = '/';
      } else {
        alert(data.error || 'Greška pri brisanju naloga');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
              <p className="text-blue-100">{user.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded text-sm transition"
            >
              Odjavi se
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Izmena profila</h2>
                <ProfileForm />
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="text-center py-8 text-gray-500">
                Adresar će biti implementiran u narednoj fazi.
                {/* <AddressManager /> */}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="text-center py-8 text-gray-500">
                <p>Nema nedavnih narudžbina.</p>
                <button
                  onClick={() => router.push('/products')}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Započnite kupovinu
                </button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-md">
                <h2 className="text-xl font-semibold mb-4">Podešavanja aplikacije</h2>

                {/* Theme Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                  <select className="w-full border-gray-300 rounded-lg shadow-sm">
                    <option value="light">Svetla</option>
                    <option value="dark">Tamna</option>
                    <option value="system">Sistemska</option>
                  </select>
                </div>

                {/* Language Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jezik</label>
                  <select className="w-full border-gray-300 rounded-lg shadow-sm">
                    <option value="sr">Srpski</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <Button variant="outline" onClick={() => alert('Podešavanja sačuvana')}>
                  Sačuvaj podešavanja
                </Button>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Izvoz podataka</h3>
                  <p className="text-gray-600 mb-4">
                    Preuzmite kopiju svih vaših ličnih podataka koje čuvamo, uključujući istoriju narudžbina, adrese i aktivnosti.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    isLoading={isExporting}
                  >
                    Preuzmi moje podatke (JSON)
                  </Button>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold text-red-600 mb-2">Brisanje naloga</h3>
                  <p className="text-gray-600 mb-4">
                    Trajno obrišite svoj nalog i sve povezane podatke. Ova akcija je nepovratna.
                  </p>
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    isLoading={isDeleting}
                  >
                    Trajno obriši nalog
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
