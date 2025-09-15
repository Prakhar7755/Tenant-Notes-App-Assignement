import mongoose from "mongoose"

const TenantSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true }, // acme, globex
  name: { type: String, required: true },               // Human readable name
  plan: { type: String, enum: ["free", "pro"], default: "free" }, // subscription
});

const Tenant = mongoose.models?.Tenant || mongoose.model("Tenant", TenantSchema);

export default Tenant
