/**
 * triggerCriticalAction — call from any agent (CrewAI, Claude, n8n, Grok)
 * Requires a valid World ID JWT (is_human: true)
 */
export async function triggerCriticalAction(
  worldJwt: string,
  actionType: 'zoom_and_sign' | 'agent_delegation' | 'github_dispatch' | 'miniapp_action',
  metadata: Record<string, unknown>
): Promise<{ success: boolean; result: unknown }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/agent/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${worldJwt}`,
    },
    body: JSON.stringify({ action_type: actionType, metadata }),
  })

  if (!res.ok) throw new Error(`Agent trigger failed: ${res.status}`)
  return res.json()
}
