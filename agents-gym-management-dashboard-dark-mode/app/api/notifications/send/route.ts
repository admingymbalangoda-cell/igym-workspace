import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/onesignal';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

/**
 * Server-Side API Route: Send Push Notification to All Subscribed Users via OneSignal
 * Endpoint: POST /api/notifications/send
 * Body: { title: string, message: string, url?: string, data?: object, subtitle?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, url, data, subtitle, includedSegments } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Both title and message are required.' },
        { status: 400 }
      );
    }

    const result = await sendPushNotification({
      title: title.trim(),
      message: message.trim(),
      url,
      data,
      subtitle,
      includedSegments: includedSegments || ['All'],
    });

    if (!result.success && result.error && !result.id) {
      return NextResponse.json(
        { success: false, error: result.error, details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification triggered successfully.',
      id: result.id,
      recipients: result.recipients,
    });
  } catch (err: any) {
    console.error('⚠️ Exception in /api/notifications/send route:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
