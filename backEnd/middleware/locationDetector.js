const axios = require('axios');
const IPINFO_TOKEN = process.env.IPINFO_TOKEN; // Get from ipinfo.io

const detectLocation = async (req, res, next) => {
  try {
    // Skip if location already provided
    if (req.body.preferredLocation) return next();
    
    // Get client IP (works differently in production)
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Get location from IP
    const response = await axios.get(`https://ipinfo.io/${clientIp}?token=${IPINFO_TOKEN}`);
    const { city, region, country } = response.data;
    
    // Attach detected location to request
    req.detectedLocation = `${city}, ${region}, ${country}`;
    next();
  } catch (err) {
    console.error('Location detection failed:', err);
    // Continue without location if detection fails
    next();
  }
};

module.exports = detectLocation;