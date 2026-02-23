// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { isAdmin } from '@/lib/auth/permissions';
import { UserRole } from '@prisma/client';
import { logAuditAction } from '@/lib/audit';

/**
 * GET /api/admin/users
 * Lista svih korisnika (Admin+)
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || !isAdmin(payload.role as UserRole)) {
            return NextResponse.json(
                { success: false, error: 'Nemate pristup' },
                { status: 403 }
            );
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phoneNumber: true,
                createdAt: true,
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                        sessions: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const roleCounts = {
            total: users.length,
            customers: users.filter(u => u.role === 'CUSTOMER').length,
            moderators: users.filter(u => u.role === 'MODERATOR').length,
            admins: users.filter(u => u.role === 'ADMIN').length,
            superAdmins: users.filter(u => u.role === 'SUPER_ADMIN').length,
        };

        return NextResponse.json({
            success: true,
            data: { users, roleCounts },
        });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/users
 * Menja ulogu korisnika (Admin+)
 * Body: { userId, role }
 */
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || !isAdmin(payload.role as UserRole)) {
            return NextResponse.json(
                { success: false, error: 'Nemate pristup' },
                { status: 403 }
            );
        }

        const { userId, role } = await request.json();

        if (!userId || !role) {
            return NextResponse.json(
                { success: false, error: 'userId i role su obavezni' },
                { status: 400 }
            );
        }

        // Ne može menjati sopstvenu ulogu
        if (userId === payload.userId) {
            return NextResponse.json(
                { success: false, error: 'Ne možete menjati sopstvenu ulogu' },
                { status: 400 }
            );
        }

        // Samo SUPER_ADMIN može postaviti ADMIN ili SUPER_ADMIN ulogu
        if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && payload.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Samo Super Admin može dodeljivati admin uloge' },
                { status: 403 }
            );
        }

        const validRoles = ['CUSTOMER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Nevalidna uloga' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: role as UserRole },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        await logAuditAction({
            userId: payload.userId,
            action: 'user.role.change',
            target: userId,
            details: { newRole: role, changedBy: payload.userId },
        });

        return NextResponse.json({
            success: true,
            message: `Uloga korisnika promenjena u ${role}`,
            data: updatedUser,
        });
    } catch (error) {
        console.error('Update user role error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/users?userId=xxx
 * Briše korisnika (Admin+)
 */
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || !isAdmin(payload.role as UserRole)) {
            return NextResponse.json(
                { success: false, error: 'Nemate pristup' },
                { status: 403 }
            );
        }

        const userId = request.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId je obavezan' },
                { status: 400 }
            );
        }

        if (userId === payload.userId) {
            return NextResponse.json(
                { success: false, error: 'Ne možete obrisati sopstveni nalog' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Korisnik nije pronađen' },
                { status: 404 }
            );
        }

        // Ne može obrisati admina ako nisi super admin
        if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && payload.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Samo Super Admin može brisati admine' },
                { status: 403 }
            );
        }

        await prisma.user.delete({ where: { id: userId } });

        await logAuditAction({
            userId: payload.userId,
            action: 'user.delete',
            target: userId,
            details: { deletedEmail: user.email, deletedRole: user.role },
        });

        return NextResponse.json({
            success: true,
            message: 'Korisnik obrisan',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}
