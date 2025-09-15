import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/user.model";
import Tenant from "@/models/tenant.model";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectToDatabase();

  const { email, password, tenantSlug } = await req.json();

  if (!email || !password || !tenantSlug) {
    return NextResponse.json(
      { error: "Email, password and tenantSlug are required" },
      { status: 400 }
    );
  }

  const tenant = await Tenant.findOne({ slug: tenantSlug });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    passwordHash,
    role: "member", // default is member
    tenantSlug,
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      tenant: user.tenantSlug,
    },
  });
}
