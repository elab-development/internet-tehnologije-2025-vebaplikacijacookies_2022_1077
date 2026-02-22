'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProductFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <Input
        label="Naziv"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Cena (RSD)"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <Input
          label="Zaliha"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive ?? true}
          onChange={handleCheckboxChange}
          id="isActive"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Aktivan proizvod</label>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onCancel}>Otkaži</Button>
        <Button type="submit" variant="primary">Sačuvaj</Button>
      </div>
    </form>
  );
}
