'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProductForm } from '@/components/admin/ProductForm'; // Importujemo formu (sledi)

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100'); // Limit 100 za admina
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    // Otvori modal ili preusmeri na stranicu za editovanje
    // Ovde pojednostavljeno - otvaramo formu u istoj stranici
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert('Brisanje nije uspelo. Proverite da li proizvod ima aktivne narudžbine.');
      }
    } catch (error) {
      alert('Greška pri brisanju');
    }
  };

  const handleCreateNew = () => {
    setEditingProduct({ id: null, name: '', price: 0, stock: 0 }); // Prazan objekat
  };

  const handleFormSubmit = async (formData: any) => {
    // Logika za POST (create) ili PUT (update)
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/products/${formData.id}` : '/api/products';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setEditingProduct(null);
      fetchProducts(); // Osveži listu
    } else {
      alert('Greška pri čuvanju');
    }
  };

  if (isLoading) return <div>Učitavanje...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upravljanje Proizvodima</h1>
        <Button onClick={handleCreateNew}>Dodaj Novi Proizvod</Button>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct.id ? 'Izmeni Proizvod' : 'Novi Proizvod'}
            </h2>
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Naziv</th>
            <th className="py-2 px-4 border-b text-left">Cena</th>
            <th className="py-2 px-4 border-b text-left">Zaliha</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-right">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{product.name}</td>
              <td className="py-2 px-4 border-b">{product.price} RSD</td>
              <td className="py-2 px-4 border-b">{product.stock}</td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 rounded text-xs ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.isActive ? 'Aktivan' : 'Neaktivan'}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Izmeni</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>Obriši</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
