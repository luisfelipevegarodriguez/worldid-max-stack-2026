import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { worldchain } from "viem/chains";

const rpc = createPublicClient({ chain: worldchain, transport: http(process.env.WORLD_CHAIN_RPC_URL!) });

async function rpcOk(): Promise<boolean> {
  try { await rpc.getBlockNumber(); return true; } catch { return false; }
}

async function codeAt(addr: string): Promise<boolean> {
  try {
    const code = await rpc.getBytecode({ address: addr as `0x${string}` });
    return !!code && code !== "0x";
  } catch { return false; }
}

async function rollback(): Promise<void> {
  const { execSync } = await import("child_process");
  try {
    execSync(
      `gcloud run services update-traffic world-backend --region=europe-west1 --to-revisions=LATEST=0 2>/dev/null || true`
    );
  } catch {}
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const checks = await Promise.all([
    { name: "rpc",    ok: await rpcOk() },
    { name: "router", ok: await codeAt(process.env.PAYMENT_ROUTER_ADDR ?? "") },
    { name: "world",  ok: await fetch("https://developer.world.org/api/v2/status").then(r => r.ok).catch(() => false) },
  ]);

  const allOk = checks.every(c => c.ok);

  if (!allOk && process.env.SLACK_WEBHOOK) {
    await fetch(process.env.SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 *self-heal* fallo detectado:\n\`\`\`${JSON.stringify(checks, null, 2)}\`\`\``,
      }),
    }).catch(() => {});
    await rollback();
  }

  return NextResponse.json({ ok: allOk, checks, ts: new Date().toISOString() });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "self-heal endpoint active" });
}
