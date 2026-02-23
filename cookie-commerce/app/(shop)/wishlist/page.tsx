// app/(shop)/wishlist/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';

interface WishlistItem {
    id: string;
    productId: string;
    addedAt: string;
    product: {
        id: string;
        name: string;
        description: string;
        price: number;
        currency: string;
        stock: number;
        imageUrl: string | null;
        isActive: boolean;
        category: { name: string } | null;
    };
}

export default function WishlistPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { addItem } = useCart();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setItems(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchWishlist();
        else if (!authLoading) setIsLoading(false);
    }, [user, authLoading]);

    const handleRemove = async (productId: string) => {
        await fetch(`/api/wishlist?productId=${productId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        setItems(items.filter(i => i.productId !== productId));
    };

    const handleAddToCart = async (productId: string) => {
        const result = await addItem(productId, 1);
        if (result.success) {
            alert('Dodato u korpu!');
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD', minimumFractionDigits: 0 }).format(price);

    if (!authLoading && !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Lista želja</h2>
                <p className="text-gray-500 mb-4">Morate biti prijavljeni da biste videli listu želja.</p>
                <Button onClick={() => router.push('/login')}>Prijavite se</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Lista želja</h1>
                <p className="text-gray-500 mb-8">{items.length} {items.length === 1 ? 'proizvod' : 'proizvoda'}</p>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border">
                        <p className="text-4xl mb-4">💝</p>
                        <p className="text-gray-600 mb-4">Vaša lista želja je prazna</p>
                        <Button onClick={() => router.push('/products')}>Pregledajte proizvode</Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                                <div
                                    className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden cursor-pointer"
                                    onClick={() => router.push(`/products/${item.product.id}`)}
                                >
                                    {item.product.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Nema slike</div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3
                                        className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
                                        onClick={() => router.push(`/products/${item.product.id}`)}
                                    >
                                        {item.product.name}
                                    </h3>
                                    {item.product.category && (
                                        <p className="text-xs text-gray-500">{item.product.category.name}</p>
                                    )}
                                    <p className="text-lg font-bold text-gray-900 mt-1">{formatPrice(item.product.price)}</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button size="sm" variant="primary" onClick={() => handleAddToCart(item.product.id)} disabled={item.product.stock === 0}>
                                        {item.product.stock > 0 ? 'U korpu' : 'Nema'}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleRemove(item.productId)}>
                                        Ukloni
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
