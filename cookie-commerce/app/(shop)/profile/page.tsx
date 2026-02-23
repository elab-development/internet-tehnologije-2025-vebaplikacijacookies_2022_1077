// app/(shop)/profile/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    { id: 'password', label: 'Lozinka' },
    { id: 'addresses', label: 'Adrese' },
    { id: 'orders', label: 'Narudžbine' },
    { id: 'settings', label: 'Podešavanja' },
    { id: 'privacy', label: 'Privatnost (GDPR)' },
  ];

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/user/export-data');
      const data = await res.json();

      if (data.success) {
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

            {activeTab === 'password' && <PasswordChangeSection />}
            {activeTab === 'addresses' && <AddressesSection />}
            {activeTab === 'orders' && <OrdersSection />}
            {activeTab === 'settings' && <SettingsSection />}

            {activeTab === 'privacy' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Izvoz podataka</h3>
                  <p className="text-gray-600 mb-4">
                    Preuzmite kopiju svih vaših ličnih podataka koje čuvamo, uključujući istoriju narudžbina, adrese i aktivnosti.
                  </p>
                  <Button variant="outline" onClick={handleExportData} isLoading={isExporting}>
                    Preuzmi moje podatke (JSON)
                  </Button>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold text-red-600 mb-2">Brisanje naloga</h3>
                  <p className="text-gray-600 mb-4">
                    Trajno obrišite svoj nalog i sve povezane podatke. Ova akcija je nepovratna.
                  </p>
                  <Button variant="danger" onClick={handleDeleteAccount} isLoading={isDeleting}>
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

// ============================
// Password Change Section
// ============================
function PasswordChangeSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage('✅ Lozinka uspešno promenjena!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage('❌ Došlo je do greške');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-semibold mb-6">Promena lozinke</h2>
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 text-sm">{message}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Trenutna lozinka"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          fullWidth
        />
        <Input
          label="Nova lozinka (min 8 karaktera)"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          fullWidth
        />
        <Input
          label="Potvrdi novu lozinku"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Promeni lozinku
        </Button>
      </form>
    </div>
  );
}

// ============================
// Addresses Section
// ============================
function AddressesSection() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    type: 'SHIPPING', street: '', city: '', postalCode: '', country: 'Srbija', isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setAddresses(data.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
        setShowForm(false);
        setNewAddr({ type: 'SHIPPING', street: '', city: '', postalCode: '', country: 'Srbija', isDefault: false });
      }
    } catch (err) { console.error(err); }
  };

  if (isLoading) return <p className="text-gray-500">Učitavanje adresa...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Moje adrese</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Otkaži' : '+ Nova adresa'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 rounded-xl border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
              <select
                value={newAddr.type}
                onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="SHIPPING">Za dostavu</option>
                <option value="BILLING">Za naplatu</option>
              </select>
            </div>
            <Input label="Država" value={newAddr.country} onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })} fullWidth />
          </div>
          <Input label="Ulica i broj" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} required fullWidth />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Grad" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} required fullWidth />
            <Input label="Poštanski broj" value={newAddr.postalCode} onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })} required fullWidth />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })} />
            Podrazumevana adresa
          </label>
          <Button type="submit" variant="primary" size="sm">Sačuvaj adresu</Button>
        </form>
      )}

      {addresses.length === 0 ? (
        <p className="text-gray-500 text-sm">Nemate sačuvanih adresa.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="p-4 bg-white border rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${addr.type === 'SHIPPING' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {addr.type === 'SHIPPING' ? 'Dostava' : 'Naplata'}
                  </span>
                  {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Podrazumevana</span>}
                </div>
                <p className="text-sm text-gray-900">{addr.street}</p>
                <p className="text-xs text-gray-500">{addr.postalCode} {addr.city}, {addr.country}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================
// Orders Section
// ============================
function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      const data = await res.json();
      // api/orders je POST-only za kreiranje, treba GET za user orders
      // Koristimo prazan niz ako GET ne postoji
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(price);

  if (isLoading) return <p className="text-gray-500">Učitavanje narudžbina...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Istorija narudžbina</h2>
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-4">📦</p>
          <p>Nemate nijednu narudžbinu.</p>
          <Link href="/products" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Započnite kupovinu</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="p-4 bg-white border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-semibold">{order.orderNumber}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold
                  ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : ''}
                  ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                  ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{formatPrice(order.totalAmount)}</p>
              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('sr-RS')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================
// Settings Section (SK-5)
// ============================
function SettingsSection() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('sr');
  const [currency, setCurrency] = useState('RSD');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Učitaj postojeće preferencije
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch('/api/user/preferences', { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data) {
          setTheme(data.data.theme || 'light');
          setLanguage(data.data.language || 'sr');
          setCurrency(data.data.currency || 'RSD');
        }
      } catch (err) { console.error(err); }
      finally { setIsLoaded(true); }
    };
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ theme, language, currency }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage('✅ Podešavanja sačuvana!');
        // Primeni temu lokalno
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
        localStorage.setItem('language', language);
        localStorage.setItem('currency', currency);
      } else {
        setMessage('❌ Greška pri čuvanju');
      }
    } catch {
      setMessage('❌ Došlo je do greške');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateTimeout = async () => {
    try {
      const res = await fetch('/api/auth/simulate-timeout', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setMessage('⏳ ' + data.message);
        setTimeout(() => window.location.reload(), 1500); // Reload da bi SessionWarning uhvatio novi token
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch {
      setMessage('❌ Greška pri simulaciji');
    }
  };

  if (!isLoaded) return <p className="text-gray-500">Učitavanje podešavanja...</p>;

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-xl font-semibold mb-4">Podešavanja aplikacije</h2>

      {message && (
        <div className="p-3 rounded-lg bg-blue-50 text-sm">{message}</div>
      )}

      {/* Theme Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border"
        >
          <option value="light">Svetla</option>
          <option value="dark">Tamna</option>
          <option value="system">Sistemska</option>
        </select>
      </div>

      {/* Language Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Jezik</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border"
        >
          <option value="sr">Srpski</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Currency Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Valuta</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 border"
        >
          <option value="RSD">RSD (Srpski dinar)</option>
          <option value="EUR">EUR (Evro)</option>
          <option value="USD">USD (Američki dolar)</option>
        </select>
      </div>

      <Button variant="primary" onClick={handleSave} isLoading={isSaving} className="w-full mb-4">
        Sačuvaj podešavanja
      </Button>

      <div className="border-t pt-4 mt-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Testiranje i Debagovanje</h3>
        <p className="text-xs text-gray-500 mb-3">Samo za razvoj: prebacuje istek sesije na 2 minuta kako bi se prikazao Session Warning.</p>
        <Button variant="outline" onClick={handleSimulateTimeout} className="w-full text-orange-600 border-orange-200 hover:bg-orange-50">
          Simuliraj istek sesije (120s)
        </Button>
      </div>
    </div>
  );
}
