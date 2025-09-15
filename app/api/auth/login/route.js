import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectToDatabase();

  const { email, password } = await req.json();
  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tenantSlug: user.tenantSlug,
    },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );

  return NextResponse.json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      tenantSlug: user.tenantSlug,
    },
  });
}
