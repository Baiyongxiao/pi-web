import { debugSessionRegistry } from "@/lib/rpc-manager";

export const dynamic = "force-dynamic";

// GET /api/debug/registry — introspect in-memory AgentSession registry.
// Temporary diagnostic endpoint for memory-leak investigation.
export async function GET() {
  return Response.json(debugSessionRegistry());
}