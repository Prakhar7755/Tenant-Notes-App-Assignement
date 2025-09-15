import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String },
    tenantSlug: { type: String, required: true }, // for tenant isolation
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // creator
  },
  { timestamps: true }
);

const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);
export default Note;
