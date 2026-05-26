export type SubscribePayload = {
  email?: string;
  name?: string;
  source?: string;
  tags?: string[];
  [key: string]: any;
};

export async function subscribeEmail(_payload: SubscribePayload): Promise<{ ok: boolean }> {
  // No-op stub: famous.ai integration removed. Keep signature for callers.
  // If you later want to enable a real CRM, implement network logic here
  // and drive the endpoint from an environment variable.
  return { ok: true };
}
