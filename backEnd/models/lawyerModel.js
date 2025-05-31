const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const lawyerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "../uploads/default_avatar.png" },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  country: { type: String, default: "Ethiopia" },
  region: { type: String },
  city: { type: String },
  streetAddress: { type: String },
  postalCode: { type: Number },
  userType: { type: String, default: "Lawyer" },
  licenseNumber: { type: String, required: true, unique: true },
  barCertificate: { type: String },
  yearsOfExperience: { type: Number, required: true },
  specialization: { type: [String], required: true },
  courtRepresentation: { type: String },
  languagesSpoken: { type: [String] },
  lawDegree: { type: String },
  universityName: { type: String },
  graduationYear: { type: Number },
  additionalCertifications: { type: String },
  consultationFee: { type: Number },
  availability: { type: String },
  preferredMode: { type: [String] },
  caseCapacity: { type: Number },
  states: { type: Boolean, default: false }, // New field
   approved: {
    type: String,
    enum: ["new", "approved", "rejected"], // Define allowed values
    default: "new", // Default value for new lawyers
  },  
  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

// Add pre-save hook to calculate average rating
lawyerSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.ratingCount = this.ratings.length;
  } else {
    this.averageRating = 0;
    this.ratingCount = 0;
  }
  next();
});

const Lawyer = mongoose.models.Lawyer || mongoose.model('Lawyer', lawyerSchema);
module.exports = Lawyer;
 