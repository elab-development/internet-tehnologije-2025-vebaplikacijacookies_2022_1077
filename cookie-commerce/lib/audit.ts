// lib/audit.ts

import { prisma } from '@/lib/db/prisma';

/**
 * Loguje akciju u AuditLog tabelu
 * Koristi se za praćenje svih bitnih akcija (Super Admin audit trail)
 */
export async function logAuditAction({
    userId,
    action,
    target,
    details,
    ipAddress,
}: {
    userId?: string | null;
    action: string;
    target?: string | null;
    details?: Record<string, unknown> | null;
    ipAddress?: string | null;
}) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: userId || null,
                action,
                target: target || null,
                details: details ? JSON.stringify(details) : null,
                ipAddress: ipAddress || null,
            },
        });
    } catch (error) {
        // Ne želimo da audit log greška obori glavnu operaciju
        console.error('Audit log error:', error);
    }
}
