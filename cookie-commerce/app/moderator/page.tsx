// app/moderator/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface ReviewForModeration {
    id: string;
    rating: number;
    comment: string | null;
    isApproved: boolean;
    isReported: boolean;
    createdAt: string;
    user: { id: string; firstName: string; lastName: string; email: string };
    product: { id: string; name: string; imageUrl: string | null };
}

interface Counts {
    total: number;
    pending: number;
    approved: number;
    reported: number;
}

export default function ModeratorPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [reviews, setReviews] = useState<ReviewForModeration[]>([]);
    const [counts, setCounts] = useState<Counts>({ total: 0, pending: 0, approved: 0, reported: 0 });
    const [filter, setFilter] = useState('pending');
    const [isLoading, setIsLoading] = useState(true);

    const isMod = user?.role === 'MODERATOR' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const fetchReviews = async (status: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/moderator/reviews?status=${status}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setReviews(data.data.reviews);
                setCounts(data.data.counts);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isMod) fetchReviews(filter);
        else if (!authLoading) setIsLoading(false);
    }, [user, authLoading, filter]);

    const handleAction = async (reviewId: string, action: 'approve' | 'reject' | 'report') => {
        try {
            const res = await fetch(`/api/moderator/reviews/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (data.success) {
                fetchReviews(filter);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovu recenziju?')) return;
        try {
            await fetch(`/api/moderator/reviews/${reviewId}`, { method: 'DELETE', credentials: 'include' });
            fetchReviews(filter);
        } catch (err) {
            console.error(err);
        }
    };

    const renderStars = (count: number) => '★'.repeat(count) + '☆'.repeat(5 - count);

    if (!authLoading && !isMod) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Pristup odbijen</h2>
                <p className="text-gray-500">Ova stranica je dostupna samo moderatorima.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Moderatorski panel</h1>
                <p className="text-gray-500 mb-8">Upravljanje recenzijama korisnika</p>

                {/* Statistika */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Ukupno', count: counts.total, color: 'bg-blue-50 text-blue-700', key: 'all' },
                        { label: 'Na čekanju', count: counts.pending, color: 'bg-yellow-50 text-yellow-700', key: 'pending' },
                        { label: 'Odobrene', count: counts.approved, color: 'bg-green-50 text-green-700', key: 'approved' },
                        { label: 'Prijavljene', count: counts.reported, color: 'bg-red-50 text-red-700', key: 'reported' },
                    ].map((stat) => (
                        <button
                            key={stat.key}
                            onClick={() => setFilter(stat.key)}
                            className={`p-4 rounded-xl border text-left transition-all ${filter === stat.key ? 'ring-2 ring-blue-500 border-blue-300' : 'hover:border-gray-300'
                                } ${stat.color}`}
                        >
                            <p className="text-2xl font-bold">{stat.count}</p>
                            <p className="text-sm font-medium">{stat.label}</p>
                        </button>
                    ))}
                </div>

                {/* Lista recenzija */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border">
                        <p className="text-4xl mb-4">✅</p>
                        <p className="text-gray-600">Nema recenzija u ovoj kategoriji</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl border p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-yellow-500">{renderStars(review.rating)}</span>
                                            {review.isReported && (
                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                                    Prijavljeno
                                                </span>
                                            )}
                                            {review.isApproved && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                    Odobreno
                                                </span>
                                            )}
                                            {!review.isApproved && !review.isReported && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                                                    Na čekanju
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            <strong>{review.user.firstName} {review.user.lastName}</strong>
                                            <span className="text-gray-400"> ({review.user.email})</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Proizvod: <strong>{review.product.name}</strong> • {new Date(review.createdAt).toLocaleDateString('sr-RS')}
                                        </p>
                                    </div>
                                </div>

                                {review.comment && (
                                    <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">
                                        &ldquo;{review.comment}&rdquo;
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    {!review.isApproved && (
                                        <Button size="sm" variant="primary" onClick={() => handleAction(review.id, 'approve')}>
                                            ✓ Odobri
                                        </Button>
                                    )}
                                    {review.isApproved && (
                                        <Button size="sm" variant="outline" onClick={() => handleAction(review.id, 'reject')}>
                                            ✕ Povuci odobrenje
                                        </Button>
                                    )}
                                    {!review.isReported && (
                                        <Button size="sm" variant="outline" onClick={() => handleAction(review.id, 'report')}>
                                            ⚠ Označi
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(review.id)}>
                                        🗑 Obriši
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
