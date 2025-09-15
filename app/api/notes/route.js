import { authenticateToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Note from "@/models/note.model";
import Tenant from "@/models/tenant.model";
import { NextResponse } from "next/server";

// ✅ create a new note
export async function POST(req) {
  try {
    await connectToDatabase();
    const user = authenticateToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Members and Admins can both create notes
    const { title, content } = await req.json();

    const tenant = await Tenant.findOne({ slug: user.tenantSlug });
    if (!tenant)
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    // Enforce free plan limit
    if (tenant.plan === "free") {
      const count = await Note.countDocuments({ tenantSlug: user.tenantSlug });
      if (count >= 3) {
        return NextResponse.json(
          { error: "Free plan limit reached" },
          { status: 403 }
        );
      }
    }
    const note = await Note.create({
      title,
      content,
      tenantSlug: user.tenantSlug,
      createdBy: user.id,
    });

    return NextResponse.json({ note, success: true }, { status: "202" });
  } catch (err) {
    console.error(err.message || "failed to create a note");
    return NextResponse.json({ success: false });
  }
}

// ✅ list all notes for current tenant
export async function GET(req) {
  await connectToDatabase();
  const user = authenticateToken(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await Note.find({ tenantSlug: user.tenantSlug }).sort({
    createdAt: -1,
  });
  return NextResponse.json({notes});
}


