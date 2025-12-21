// src/server/api/projects-activity-all.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectActivity, projects, projectActivityTypes } from '@/lib/feature-pack-schemas';
import { eq, desc, and } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * GET /api/projects/activity/all
 * List all activities across all projects (for timeline view)
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const db = getDb();
        const { searchParams } = new URL(request.url);
        // Optional filtering
        const projectId = searchParams.get('projectId');
        const typeId = searchParams.get('typeId');
        // Build query conditions
        const conditions = [];
        if (projectId) {
            conditions.push(eq(projectActivity.projectId, projectId));
        }
        if (typeId) {
            conditions.push(eq(projectActivity.typeId, typeId));
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        // Get activities with activity type and project joins
        const activitiesResult = await db
            .select({
            id: projectActivity.id,
            projectId: projectActivity.projectId,
            projectName: projects.name,
            typeId: projectActivity.typeId,
            activityType: projectActivity.activityType,
            title: projectActivity.title,
            userId: projectActivity.userId,
            description: projectActivity.description,
            link: projectActivity.link,
            occurredAt: projectActivity.occurredAt,
            metadata: projectActivity.metadata,
            createdAt: projectActivity.createdAt,
            activityTypeRecord: {
                id: projectActivityTypes.id,
                key: projectActivityTypes.key,
                name: projectActivityTypes.name,
                category: projectActivityTypes.category,
                color: projectActivityTypes.color,
                icon: projectActivityTypes.icon,
            },
        })
            .from(projectActivity)
            .leftJoin(projects, eq(projectActivity.projectId, projects.id))
            .leftJoin(projectActivityTypes, eq(projectActivity.typeId, projectActivityTypes.id))
            .where(whereClause)
            .orderBy(desc(projectActivity.occurredAt));
        // Flatten the response structure
        const activities = activitiesResult.map((row) => ({
            ...row,
            activityTypeRecord: row.activityTypeRecord?.id ? row.activityTypeRecord : null,
        }));
        return NextResponse.json({
            data: activities,
        });
    }
    catch (error) {
        console.error('[projects] List all activity error:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
