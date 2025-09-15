import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Note from "@/models/note.model";
import { authenticateToken } from "@/lib/auth";

// get a single note
export async function GET(req, context) {
  try {
    const { params } = context;
    await connectToDatabase();
    const user =  authenticateToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const note = await Note.findOne({
      _id: params.id,
      tenantSlug: user.tenantSlug,
    });
    if (!note)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    return NextResponse.json(note);
  } catch (err) {
    console.error("Failed to fetch the note", err.message);
    return NextResponse.json({
      success: false,
      error: err.message || "failed to fetch the note",
    });
  }
}

// update a note
export async function PUT(req, context) {
  try {
    const { params } = context;
    await connectToDatabase();
    const user =  authenticateToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content } = await req.json();

    const note = await Note.findOneAndUpdate(
      { _id: params.id, tenantSlug: user.tenantSlug },
      { title, content },
      { new: true }
    );

    if (!note)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    return NextResponse.json(note);
  } catch (err) {
    console.error("Failed to update the note", err.message);
    return NextResponse.json({
      success: false,
      error: err.message || "failed to update the note",
    });
  }
}

// delete a note
export async function DELETE(req, context) {
  try {
    const { params } = context;
    await connectToDatabase();
    const user = authenticateToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const note = await Note.findOneAndDelete({
      _id: params.id,
      tenantSlug: user.tenantSlug,
    });
    if (!note)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete the note", err.message);
    return NextResponse.json({
      success: false,
      error: err.message || "failed to delete the note",
    });
  }
}
