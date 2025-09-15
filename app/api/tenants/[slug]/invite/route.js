import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Tenant from "@/models/tenant.model";
import { authenticateToken, checkRole } from "@/lib/auth";

export async function POST(req, { params }) {
  await connectToDatabase();

  const adminUser = authenticateToken(req);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRole(adminUser, "admin")) {
    return NextResponse.json(
      { error: "Forbidden: only admins can upgrade" },
      { status: 403 }
    );
  }

  if (adminUser.tenantSlug !== params.slug) {
    return NextResponse.json(
      { error: "Cannot upgrade another tenant" },
      { status: 403 }
    );
  }

  const tenant = await Tenant.findOne({ slug: params.slug });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  if (tenant.plan === "pro") {
    return NextResponse.json({ message: "Tenant already upgraded" });
  }

  tenant.plan = "pro";
  await tenant.save();

  return NextResponse.json({ success: true, tenant });
}
