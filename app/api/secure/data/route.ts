import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    secret_payload: "Vercel_Sandbox_Flag_Validated",
    mcp_target_node: "edge_bypassed_successfully",
  })
}
