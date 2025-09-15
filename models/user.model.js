import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  tenantSlug: { type: String, required: true },
});

const User = mongoose.models?.User || mongoose.model("User", UserSchema);

export default User;
