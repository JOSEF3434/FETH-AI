const path = require("path");
const bcrypt = require("bcryptjs");
//const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const upload = require("../middleware/upload");
const Lawyer = require("../models/lawyerModel");
const { matchingModel } = require('../utils/gemini');
const { sendStateChangeEmail } = require("../utils/emailService");

// Lawyer signup function
const lawyerSignup = async (req, res) => {
  try {
    // Check for uploaded files
    const profilePicture = req.files?.profilePicture
      ? `../uploads/${req.files.profilePicture[0].filename}`
      : "../uploads/default_avatar.png";
    const barCertificate = req.files?.barCertificate
      ? `../uploads/${req.files.barCertificate[0].filename}`
      : "";
    const additionalCertifications = req.files?.additionalCertifications
      ? `../uploads/${req.files.additionalCertifications[0].filename}`
      : "";

    // Extract other data from req.body
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      dob,
      country,
      region,
      city,
      streetAddress,
      postalCode,
      licenseNumber,
      yearsOfExperience,
      specialization,
      courtRepresentation,
      languagesSpoken,
      lawDegree,
      universityName,
      graduationYear,
      consultationFee,
      availability,
      preferredMode,
      caseCapacity,
    } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Lawyer instance
    const newLawyer = new Lawyer({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      profilePicture,
      gender,
      dob,
      country,
      region,
      city,
      streetAddress,
      postalCode,
      licenseNumber,
      barCertificate,
      yearsOfExperience,
      specialization,
      courtRepresentation,
      languagesSpoken,
      lawDegree,
      universityName,
      graduationYear,
      additionalCertifications,
      consultationFee,
      availability,
      preferredMode,
      caseCapacity,
      approved: "new", // Default status
    });

    // Save the lawyer to the database
    await newLawyer.save();

    // Respond with success
    res.status(201).json({
      message: "Lawyer registered successfully",
      lawyer: newLawyer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Login Controller
const lawyerLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const lawyer = await Lawyer.findOne({ email });

    if (!lawyer) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Ensure password is a string
    const passwordStr = String(password);
    const isMatch = await bcrypt.compare(passwordStr, lawyer.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Create JWT token
    const token = jwt.sign({
      lawyerId: lawyer._id,
      name: `${lawyer.firstName} ${lawyer.lastName}`,
      email: lawyer.email,
      profilePicture: lawyer.profilePicture,
      userType: lawyer.userType,
      licenseNumber: lawyer.licenseNumber,
      specialization: lawyer.specialization,
      city: lawyer.city,
      region: lawyer.region,
      languagesSpoken: lawyer.languagesSpoken,
      yearsOfExperience: lawyer.yearsOfExperience
    }, process.env.JWT_SECRET, { expiresIn: "3d" });

    res.status(200).json({
      message: "Login successful",
      token,
      lawyer: {
        _id: lawyer._id,
        name: `${lawyer.firstName} ${lawyer.lastName}`,
        email: lawyer.email,
        profilePicture: lawyer.profilePicture.includes('http') 
          ? lawyer.profilePicture 
          : lawyer.profilePicture.startsWith('../uploads/')
            ? `http://localhost:4000${lawyer.profilePicture.replace('..', '')}`
            : `http://localhost:4000/uploads/${lawyer.profilePicture}`,
        userType: lawyer.userType,
        licenseNumber: lawyer.licenseNumber,
        specialization: lawyer.specialization,
        city: lawyer.city,   
        region: lawyer.region,
        languagesSpoken: lawyer.languagesSpoken,
        yearsOfExperience: lawyer.yearsOfExperience
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all rejected lawyers
const gatAllrejectLawyer = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ approved: "rejected" });
    res.status(200).json(lawyers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Count approved lawyers
const countApprovedLawyers = async (req, res) => {
  try {
    const count = await Lawyer.countDocuments({ approved: "approved" });
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Toggle activation status (states)
const toggleLawyerState = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyer = await Lawyer.findById(id);
    if (!lawyer) return res.status(404).json({ error: "Lawyer not found" });

    const newState = !lawyer.states;
    lawyer.states = newState;
    await lawyer.save();

    // Send email notification
    try {
      await sendStateChangeEmail(
        lawyer.email,
        `${lawyer.firstName} ${lawyer.lastName}`,
        newState ? 'activate' : 'deactivate'
      );
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the whole request if email fails
    }

    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all active & approved lawyers (states: true, approved: true)
const getActiveApprovedLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ approved: "approved" });
    res.status(200).json(lawyers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single lawyer details
const getLawyerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyer = await Lawyer.findById(id);
    if (!lawyer) return res.status(404).json({ error: "Lawyer not found" });

    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all unapproved lawyers
const getUnapprovedLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ approved: "new" });
    res.status(200).json(lawyers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve a lawyer
const approveLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyer = await Lawyer.findByIdAndUpdate(
      id,
      { approved: "approved" },
      { new: true }
    );
    res.status(200).json(lawyer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject a lawyer
const rejectLawyer = async (req, res) => {
  try {
    const { id } = req.params;
    await Lawyer.findByIdAndUpdate(id, { approved: "rejected" });
    res.status(200).json({ message: "Lawyer rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all approved lawyers
const getApprovedLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ approved: "approved" });
    res.status(200).json(lawyers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update the getRecommendedLawyers function
const getRecommendedLawyers = async (req, res) => {
  try {
    const { type, subclass, preferredLocation, language, query } = req.body;
    const defaultLocation = "Addis Ababa"; // Default fallback location

    // Input validation
    if (!type || !subclass || !query) {
      return res.status(400).json({ 
        success: false,
        error: "Type, subclass, and query are required fields"
      });
    }

    console.time('Database query');
    
    // Single optimized query with data cleaning and smart matching
    const lawyers = await Lawyer.aggregate([
      {
        $match: {
          approved: "approved",
          states: true
        }
      },
      {
        $addFields: {
          // Clean up specialization field
          cleanSpecialization: {
            $map: {
              input: "$specialization",
              as: "spec",
              in: {
                $cond: [
                  { $eq: [{ $type: "$$spec" }, "string"] },
                  { $trim: { input: "$$spec", chars: "[]\"" } },
                  "$$spec"
                ]
              }
            }
          },
          // Determine effective location (preferred or default)
          effectiveLocation: {
            $cond: [
              { $and: [
                preferredLocation,
                { $or: [
                  { $ifNull: ["$city", false] },
                  { $ifNull: ["$region", false] }
                ]}
              ]},
              preferredLocation,
              defaultLocation
            ]
          }
        }
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              // Specialization scoring (50 points max)
              {
                $switch: {
                  branches: [
                    // Exact subclass match (50 points)
                    {
                      case: {
                        $gt: [
                          {
                            $size: {
                              $filter: {
                                input: "$cleanSpecialization",
                                as: "spec",
                                cond: { $regexMatch: { input: "$$spec", regex: new RegExp(`\\b${subclass}\\b`, 'i') } }
                              }
                            }
                          },
                          0
                        ]
                      },
                      then: 50
                    },
                    // Related type match (30 points)
                    {
                      case: {
                        $gt: [
                          {
                            $size: {
                              $filter: {
                                input: "$cleanSpecialization",
                                as: "spec",
                                cond: { $regexMatch: { input: "$$spec", regex: new RegExp(type, 'i') } }
                              }
                            }
                          },
                          0
                        ]
                      },
                      then: 30
                    },
                    // General legal match (10 points)
                    {
                      case: {
                        $gt: [
                          {
                            $size: {
                              $filter: {
                                input: "$cleanSpecialization",
                                as: "spec",
                                cond: { $regexMatch: { input: "$$spec", regex: /law|legal/i } }
                              }
                            }
                          },
                          0
                        ]
                      },
                      then: 10
                    }
                  ],
                  default: 0
                }
              },
              
              // Location scoring (30 points max)
              {
                $switch: {
                  branches: [
                    // Exact city match (30 points)
                    {
                      case: { $regexMatch: { input: { $ifNull: ["$city", ""] }, regex: new RegExp(`^${defaultLocation}$`, 'i') } },
                      then: 30
                    },
                    // Region match (20 points)
                    {
                      case: { $regexMatch: { input: { $ifNull: ["$region", ""] }, regex: new RegExp(`^${defaultLocation}$`, 'i') } },
                      then: 20
                    },
                    // Partial match (10 points)
                    {
                      case: { 
                        $or: [
                          { $regexMatch: { input: { $ifNull: ["$city", ""] }, regex: new RegExp(defaultLocation, 'i') } },
                          { $regexMatch: { input: { $ifNull: ["$region", ""] }, regex: new RegExp(defaultLocation, 'i') } }
                        ]
                      },
                      then: 10
                    }
                  ],
                  default: 0
                }
              },
              
              // Language match (15 points if exact, 5 if partial)
              {
                $cond: [
                  { $and: [language, { $gt: [{ $size: "$languagesSpoken" }, 0] }] },
                  {
                    $cond: [
                      { $in: [language, "$languagesSpoken"] },
                      15,
                      {
                        $cond: [
                          { $gt: [
                            { $size: {
                              $filter: {
                                input: "$languagesSpoken",
                                as: "lang",
                                cond: { $regexMatch: { input: "$$lang", regex: new RegExp(language.substring(0, 3), 'i') } }
                              }
                            }},
                            0
                          ]},
                          5,
                          0
                        ]
                      }
                    ]
                  },
                  0
                ]
              },
              
              // Experience (scaled to max 10 points)
              { $min: [{ $divide: ["$yearsOfExperience", 2] }, 10] },
              
              // Rating (scaled to max 5 points)
              { $multiply: [{ $ifNull: ["$rating", 3.5] }, 1.5] }
            ]
          },
          
          // Additional match metadata
          matchDetails: {
            specializationMatch: {
              $cond: [
                { $gt: [
                  { $size: {
                    $filter: {
                      input: "$cleanSpecialization",
                      as: "spec",
                      cond: { $regexMatch: { input: "$$spec", regex: new RegExp(`\\b${subclass}\\b`, 'i') } }
                    }
                  }},
                  0
                ]},
                "exact",
                {
                  $cond: [
                    { $gt: [
                      { $size: {
                        $filter: {
                          input: "$cleanSpecialization",
                          as: "spec",
                          cond: { $regexMatch: { input: "$$spec", regex: new RegExp(type, 'i') } }
                        }
                      }},
                      0
                    ]},
                    "related",
                    "general"
                  ]
                }
              ]
            },
            locationMatch: {
              $cond: [
                { $or: [
                  { $regexMatch: { input: { $ifNull: ["$city", ""] }, regex: new RegExp(`^${defaultLocation}$`, 'i') } },
                  { $regexMatch: { input: { $ifNull: ["$region", ""] }, regex: new RegExp(`^${defaultLocation}$`, 'i') } }
                ]},
                "exact",
                {
                  $cond: [
                    { $or: [
                      { $regexMatch: { input: { $ifNull: ["$city", ""] }, regex: new RegExp(defaultLocation, 'i') } },
                      { $regexMatch: { input: { $ifNull: ["$region", ""] }, regex: new RegExp(defaultLocation, 'i') } }
                    ]},
                    "partial",
                    "none"
                  ]
                }
              ]
            }
          }
        }
      },
      { $sort: { matchScore: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          specialization: "$cleanSpecialization",
          yearsOfExperience: 1,
          city: 1,
          region: 1,
          consultationFee: 1,
          languagesSpoken: 1,
          rating: { $ifNull: ["$rating", 3.5] },
          profilePicture: 1,
          matchScore: 1,
          matchDetails: 1,
          strengths: {
            $concatArrays: [
              // Specialization strengths
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$cleanSpecialization",
                      as: "spec",
                      cond: { $or: [
                        { $regexMatch: { input: "$$spec", regex: new RegExp(`\\b${subclass}\\b`, 'i') } },
                        { $regexMatch: { input: "$$spec", regex: new RegExp(type, 'i') } }
                      ]}
                    }
                  },
                  as: "spec",
                  in: { $concat: ["Specializes in ", "$$spec"] }
                }
              },
              // Location strengths
              {
                $cond: [
                  { $or: [
                    { $regexMatch: { input: { $ifNull: ["$city", ""] }, regex: new RegExp(defaultLocation, 'i') } },
                    { $regexMatch: { input: { $ifNull: ["$region", ""] }, regex: new RegExp(defaultLocation, 'i') } }
                  ]},
                  [{ $concat: ["Based in ", { $ifNull: ["$city", "$region"] }] }],
                  []
                ]
              },
              // Experience strength
              [{ $concat: [ { $toString: "$yearsOfExperience" }, " years experience" ] }]
            ]
          }
        }
      }
    ]);
    console.timeEnd('Database query');

    // If no lawyers found
    if (lawyers.length === 0) {
      return res.json({ 
        success: true, 
        data: [],
        meta: { 
          totalAvailable: 0,
          defaultLocationUsed: true 
        }
      });
    }

    res.json({
      success: true,
      data: lawyers.slice(0, 3),
      meta: {
        totalAvailable: lawyers.length,
        defaultLocationUsed: preferredLocation ? false : true,
        matchingStrategy: {
          specialization: "exact > related > general",
          location: "exact > partial > default(Addis Ababa)"
        }
      }
    });

  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Service unavailable",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions
function runFallbackAlgorithm(lawyers, subclass, location, language) {
  return lawyers
    .map(l => ({
      ...l,
      matchScore: calculateFallbackScore(l, subclass, location, language),
      strengths: [
        `Specializes in ${l.specialization.join(', ')}`,
        `${l.yearsOfExperience} years experience`,
        l.city ? `Based in ${l.city}` : ''
      ],
      relevance: l.specialization.some(s => 
        new RegExp(subclass, 'i').test(s)
      ) ? 'exact' : 'related'
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

function calculateFallbackScore(lawyer, subclass, location, language) {
  let score = 0;
  
  // Specialization (40%)
  const exactMatch = lawyer.specialization.some(s => 
    new RegExp(`\\b${subclass}\\b`, 'i').test(s)
  );
  const typeMatch = lawyer.specialization.some(s => 
    new RegExp(subclass.split(' ')[0], 'i').test(s)
  );
  score += exactMatch ? 40 : typeMatch ? 30 : 10;

  // Experience (20%)
  score += Math.min(lawyer.yearsOfExperience * 2, 20);

  // Location (15%)
  if (location && (lawyer.city || lawyer.region)) {
    const exactMatch = [lawyer.city, lawyer.region].some(l => 
      l && new RegExp(`^${location}$`, 'i').test(l)
    );
    const partialMatch = [lawyer.city, lawyer.region].some(l => 
      l && new RegExp(location, 'i').test(l)
    );
    score += exactMatch ? 15 : partialMatch ? 10 : 5;
  }

  // Language (15%)
  if (language && lawyer.languagesSpoken) {
    score += lawyer.languagesSpoken.includes(language) ? 15 : 0;
  }

  // Rating (5%)
  score += (lawyer.rating || 3.5) * 1.4;

  // Fee (5%)
  if (lawyer.consultationFee) {
    score += Math.max(0, 5 - (lawyer.consultationFee / 1000));
  }

  return Math.min(Math.round(score), 100);
}

function formatSuccessResponse(lawyers, allLawyers) {
  return {
    success: true,
    data: lawyers,
    meta: {
      totalAvailable: allLawyers.length,
      matchPrecision: lawyers[0]?.relevance || 'general',
      aiUsed: lawyers.some(l => l.matchScore > 70)
    }
  };
}

// Update lawyer profile
const updateLawyerProfile = async (req, res) => {
  try {
    console.log('Starting profile update...');
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);

    const { id } = req.params;
    
    // 1. First check if lawyer exists
    const existingLawyer = await Lawyer.findById(id);
    if (!existingLawyer) {
      console.log('Lawyer not found with ID:', id);
      return res.status(404).json({ 
        success: false,
        error: "Lawyer not found" 
      });
    }

    // 2. Prepare the update data - start with body but remove sensitive fields
    const updateData = { ...req.body };
    delete updateData.password; // Never update password here
    delete updateData._id; // Prevent ID changes
    delete updateData.approved; // Don't allow self-approval

    // 3. Handle file uploads if they exist
    if (req.files) {
      console.log('Processing uploaded files...');
      
      if (req.files.profilePicture) {
        updateData.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
        console.log('Updated profile picture path:', updateData.profilePicture);
      }
      
      if (req.files.barCertificate) {
        updateData.barCertificate = `/uploads/${req.files.barCertificate[0].filename}`;
        console.log('Updated bar certificate path:', updateData.barCertificate);
      }
      
      if (req.files.additionalCertifications) {
        updateData.additionalCertifications = `/uploads/${req.files.additionalCertifications[0].filename}`;
        console.log('Updated certifications path:', updateData.additionalCertifications);
      }
    }

    // 4. Convert string fields to arrays where needed
    const arrayFields = ['specialization', 'languagesSpoken', 'preferredMode'];
    
    arrayFields.forEach(field => {
      if (updateData[field]) {
        console.log(`Processing array field: ${field}`);
        
        // Case 1: Already an array - use as is
        if (Array.isArray(updateData[field])) {
          console.log(`${field} is already an array`);
          return;
        }
        
        // Case 2: Stringified JSON array - parse it
        if (updateData[field].startsWith('[')) {
          try {
            updateData[field] = JSON.parse(updateData[field]);
            console.log(`Parsed JSON array for ${field}:`, updateData[field]);
            return;
          } catch (error) {
            console.log(`Failed to parse JSON for ${field}, treating as string`);
          }
        }
        
        // Case 3: Comma-separated string - split it
        if (typeof updateData[field] === 'string') {
          updateData[field] = updateData[field].split(',').map(item => item.trim());
          console.log(`Split string to array for ${field}:`, updateData[field]);
          return;
        }
        
        // Case 4: Single value - wrap in array
        updateData[field] = [updateData[field]];
        console.log(`Wrapped single value to array for ${field}:`, updateData[field]);
      }
    });

    // 5. Perform the update
    console.log('Final update data:', updateData);
    const updatedLawyer = await Lawyer.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
        context: 'query' // Needed for some validators
      }
    );

    // 6. Send success response
    console.log('Profile update successful for lawyer:', updatedLawyer._id);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      lawyer: {
        _id: updatedLawyer._id,
        firstName: updatedLawyer.firstName,
        lastName: updatedLawyer.lastName,
        email: updatedLawyer.email,
        profilePicture: updatedLawyer.profilePicture,
        specialization: updatedLawyer.specialization,
        // Include other fields you want to return
      }
    });

  } catch (error) {
    console.error('Profile update failed:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      requestFiles: req.files ? Object.keys(req.files) : null,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      success: false,
      error: "Failed to update profile",
      // Only show details in development for security
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        affectedFields: Object.keys(req.body)
      })
    });
  }
};

// Update lawyer password
const updateLawyerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const lawyer = await Lawyer.findById(id);
    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, lawyer.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    lawyer.password = hashedPassword;
    await lawyer.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Add rating to lawyer
const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id; // Assuming you have authentication middleware

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const lawyer = await Lawyer.findById(id);
    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    // Check if user already rated this lawyer
    const existingRating = lawyer.ratings.find(r => r.userId.equals(userId));
    if (existingRating) {
      return res.status(400).json({ error: "You have already rated this lawyer" });
    }

    // Add new rating
    lawyer.ratings.push({
      userId,
      rating,
      review
    });

    await lawyer.save();

    res.status(201).json({
      success: true,
      message: "Rating added successfully",
      averageRating: lawyer.averageRating,
      ratingCount: lawyer.ratingCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get lawyer ratings
const getRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyer = await Lawyer.findById(id).populate('ratings.userId', 'firstName lastName profilePicture');

    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    res.status(200).json({
      success: true,
      ratings: lawyer.ratings,
      averageRating: lawyer.averageRating,
      ratingCount: lawyer.ratingCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countNewLawyers = async (req, res) => {
  try {
    const count = await Lawyer.countDocuments({ approved: "new" });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  lawyerSignup,
  lawyerLogin,
  addRating,
  getRatings,
  rejectLawyer,
  approveLawyer,
  countNewLawyers,
  getLawyerDetails,
  toggleLawyerState,
  getApprovedLawyers,
  gatAllrejectLawyer,
  updateLawyerProfile,
  getUnapprovedLawyers,
  countApprovedLawyers,
  updateLawyerPassword,
  getRecommendedLawyers,
  getActiveApprovedLawyers
};
