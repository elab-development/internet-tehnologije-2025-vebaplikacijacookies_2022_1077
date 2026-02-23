// components/products/ProductReviews.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    isApproved: boolean;
    createdAt: string;
    user: { firstName: string; lastName: string };
}

interface ProductReviewsProps {
    productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.data.reviews);
                setAvgRating(data.data.averageRating);
                setTotalCount(data.data.totalCount);
            }
        } catch (err) {
            console.error('Fetch reviews error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productId, rating, comment }),
            });
            const data = await res.json();

            if (data.success) {
                setMessage('✅ Recenzija poslata na moderaciju!');
                setShowForm(false);
                setComment('');
                setRating(5);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            setMessage('❌ Greška pri slanju recenzije');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (count: number) => {
        return '★'.repeat(count) + '☆'.repeat(5 - count);
    };

    return (
        <div className="mt-12 border-t pt-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Recenzije</h2>
                    {totalCount > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            <span className="text-yellow-500 text-lg">{renderStars(Math.round(avgRating))}</span>
                            {' '}{avgRating.toFixed(1)} / 5 ({totalCount} {totalCount === 1 ? 'recenzija' : 'recenzija'})
                        </p>
                    )}
                </div>
                {user && !showForm && (
                    <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                        Ostavi recenziju
                    </Button>
                )}
            </div>

            {message && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
                    {message}
                </div>
            )}

            {/* Form za novu recenziju */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-xl border">
                    <h3 className="font-semibold text-gray-900 mb-3">Nova recenzija</h3>

                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ocena</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Komentar (opciono)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Podelite vaše iskustvo sa ovim proizvodom..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                            Pošalji recenziju
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                            Otkaži
                        </Button>
                    </div>
                </form>
            )}

            {/* Lista recenzija */}
            {isLoading ? (
                <p className="text-gray-500 text-sm">Učitavanje recenzija...</p>
            ) : reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">Nema odobrenih recenzija za ovaj proizvod.</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-white border rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className="text-yellow-500">{renderStars(review.rating)}</span>
                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                        {review.user.firstName} {review.user.lastName}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString('sr-RS')}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-gray-600">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!user && (
                <p className="mt-4 text-sm text-gray-500">
                    <a href="/login" className="text-blue-600 hover:underline">Prijavite se</a> da biste ostavili recenziju.
                </p>
            )}
        </div>
    );
}
