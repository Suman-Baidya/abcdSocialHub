/**
 * Official Meta Graph API Client (v19.0/v20.0)
 * Strict 2-step Instagram media container flow & Facebook Page feed publishing.
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

export interface MetaPublishResult {
  success: boolean;
  postId: string;
  containerId?: string;
  permalink?: string;
  isSimulated?: boolean;
}

export class MetaApiError extends Error {
  code?: number;
  subcode?: number;
  isAuthError: boolean;

  constructor(message: string, code?: number, subcode?: number) {
    super(message);
    this.name = "MetaApiError";
    this.code = code;
    this.subcode = subcode;
    // Meta Error 190 = Invalid OAuth Access Token, Error 102 = Session expired
    this.isAuthError = code === 190 || code === 102;
  }
}

/**
 * Publishes a post to a Facebook Page (Image photo or text/link status)
 */
export async function publishFacebookPage(
  pageId: string,
  accessToken: string,
  params: {
    message: string;
    imageUrl?: string;
  }
): Promise<MetaPublishResult> {
  // Developer test simulation mode
  if (accessToken.startsWith("mock_") || accessToken.startsWith("test_")) {
    return {
      success: true,
      postId: `mock_fb_post_${Date.now()}`,
      isSimulated: true,
    };
  }

  const isPhoto = Boolean(params.imageUrl);
  const endpoint = isPhoto
    ? `${GRAPH_API_BASE}/${pageId}/photos`
    : `${GRAPH_API_BASE}/${pageId}/feed`;

  const body: Record<string, string> = {
    access_token: accessToken,
  };

  if (isPhoto) {
    body.url = params.imageUrl!;
    body.caption = params.message;
  } else {
    body.message = params.message;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const err = data.error || {};
    throw new MetaApiError(
      err.message || `Facebook publishing failed with status ${res.status}`,
      err.code,
      err.error_subcode
    );
  }

  return {
    success: true,
    postId: data.id || data.post_id,
  };
}

/**
 * Step 1 of Instagram Publishing: Creates an IG media container.
 * Per AGENTS.md, the returned containerId MUST be persisted in DB before publish is called.
 */
export async function createInstagramContainer(
  igUserId: string,
  accessToken: string,
  params: {
    imageUrl: string;
    caption: string;
  }
): Promise<string> {
  if (accessToken.startsWith("mock_") || accessToken.startsWith("test_")) {
    return `mock_ig_container_${Date.now()}`;
  }

  const endpoint = `${GRAPH_API_BASE}/${igUserId}/media`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: params.imageUrl,
      caption: params.caption,
      access_token: accessToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const err = data.error || {};
    throw new MetaApiError(
      err.message || `Instagram container creation failed (${res.status})`,
      err.code,
      err.error_subcode
    );
  }

  return data.id;
}

/**
 * Checks the status of an Instagram media container until it is ready (FINISHED).
 */
export async function checkInstagramContainerStatus(
  containerId: string,
  accessToken: string
): Promise<{ status: "FINISHED" | "IN_PROGRESS" | "ERROR" | "EXPIRED" }> {
  if (containerId.startsWith("mock_")) {
    return { status: "FINISHED" };
  }

  const endpoint = `${GRAPH_API_BASE}/${containerId}?fields=status_code,status&access_token=${accessToken}`;
  const res = await fetch(endpoint);
  const data = await res.json();

  if (!res.ok || data.error) {
    const err = data.error || {};
    throw new MetaApiError(err.message || "Failed to check IG container status", err.code);
  }

  return {
    status: data.status_code || "FINISHED",
  };
}

/**
 * Step 2 of Instagram Publishing: Publishes the uploaded media container.
 */
export async function publishInstagramContainer(
  igUserId: string,
  accessToken: string,
  containerId: string
): Promise<MetaPublishResult> {
  if (accessToken.startsWith("mock_") || accessToken.startsWith("test_") || containerId.startsWith("mock_")) {
    return {
      success: true,
      postId: `mock_ig_post_${Date.now()}`,
      containerId,
      isSimulated: true,
    };
  }

  const endpoint = `${GRAPH_API_BASE}/${igUserId}/media_publish`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const err = data.error || {};
    throw new MetaApiError(
      err.message || `Instagram publish failed for container ${containerId}`,
      err.code,
      err.error_subcode
    );
  }

  return {
    success: true,
    postId: data.id,
    containerId,
  };
}

/**
 * High-Level Instagram Workflow:
 * 1. Creates container
 * 2. Invokes onContainerCreated callback so caller stores container ID in DB
 * 3. Polls until ready
 * 4. Publishes container
 */
export async function publishInstagramPost(
  igUserId: string,
  accessToken: string,
  params: {
    imageUrl: string;
    caption: string;
    onContainerCreated?: (containerId: string) => Promise<void>;
  }
): Promise<MetaPublishResult> {
  // Step 1: Create Container
  const containerId = await createInstagramContainer(igUserId, accessToken, {
    imageUrl: params.imageUrl,
    caption: params.caption,
  });

  // Step 2: Store Container ID immediately in DB
  if (params.onContainerCreated) {
    await params.onContainerCreated(containerId);
  }

  // Step 3: Poll status (up to 30 seconds)
  if (!containerId.startsWith("mock_")) {
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 10) {
      const check = await checkInstagramContainerStatus(containerId, accessToken);
      if (check.status === "FINISHED") {
        ready = true;
        break;
      }
      if (check.status === "ERROR" || check.status === "EXPIRED") {
        throw new MetaApiError(`Instagram media container processing failed with status: ${check.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }
  }

  // Step 4: Publish Container
  return publishInstagramContainer(igUserId, accessToken, containerId);
}
