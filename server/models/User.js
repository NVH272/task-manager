const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // có thể null nếu login Google
  googleId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);