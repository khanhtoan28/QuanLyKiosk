// models/DropdownOption.js
import mongoose from "mongoose";

const dropdownOptionSchema = new mongoose.Schema({
  options: {
    type: Map,
    of: [String],
    default: {},
  },
});

const DropdownOption = mongoose.model("DropdownOption", dropdownOptionSchema);

export default DropdownOption;
