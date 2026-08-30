export interface OneSignalNotificationOptions {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
  subtitle?: string;
  includedSegments?: string[];
}

export interface OneSignalResponse {
  success: boolean;
  id?: string;
  recipients?: number;
  errors?: string[];
  error?: string;
}

/**
 * Server-side utility function to send push notifications via OneSignal REST API.
 * Default Target: "All" subscribed users.
 */
export async function sendPushNotification({
  title,
  message,
  url,
  data,
  subtitle,
  includedSegments = ["All"],
}: OneSignalNotificationOptions): Promise<OneSignalResponse> {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "db886b5c-4ce6-4361-b633-9c1971de9c27";
  const restApiKey = process.env.ONESIGNAL_REST_API_KEY || "os_v2_app_3oegwxcm4zbwdnrttqmxdxu4e7mvzezjxgpehfnqvwcbyx3yrz5sjxyelgwvtw4buaamnuq5cm7iul6cfzqcagra4npuuvzbymgmbii";

  if (!appId || !restApiKey) {
    console.error("⚠️ OneSignal error: Missing APP_ID or REST_API_KEY");
    return { success: false, error: "Missing OneSignal credentials in environment variables." };
  }

  const payload: Record<string, any> = {
    app_id: appId,
    included_segments: includedSegments,
    headings: { en: title },
    contents: { en: message },
  };

  if (subtitle) {
    payload.subtitle = { en: subtitle };
  }

  if (url) {
    payload.url = url;
  }

  if (data) {
    payload.data = data;
  }

  try {
    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Key ${restApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json();

    if (!res.ok || (responseData.errors && responseData.errors.length > 0 && !responseData.id)) {
      console.error("⚠️ OneSignal REST API Error:", responseData);
      return {
        success: false,
        id: responseData.id,
        errors: Array.isArray(responseData.errors) ? responseData.errors : [JSON.stringify(responseData.errors)],
        error: responseData.errors ? responseData.errors[0] || "Failed to send notification" : "OneSignal API returned error",
      };
    }

    console.log("✅ OneSignal Push Notification sent successfully:", responseData);
    return {
      success: true,
      id: responseData.id,
      recipients: responseData.recipients,
    };
  } catch (err: any) {
    console.error("⚠️ Exception sending OneSignal notification:", err);
    return {
      success: false,
      error: err?.message || "Server exception during push notification dispatch",
    };
  }
}
