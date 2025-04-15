const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;
    if (file.fieldname === 'image') {
      uploadDir = path.join(__dirname, '../../uploads/restaurant');
    } else if (file.fieldname === 'ownerImage') {
      uploadDir = path.join(__dirname, '../../uploads/owner');
    } else {
      uploadDir = path.join(__dirname, '../../uploads');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'ownerImage' ? 'owner-' : 'restaurant-';
    cb(null, prefix + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (ext && mimetype) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed'));
  }
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'ownerImage', maxCount: 1 }
]);

// Get restaurant information
const getRestaurantInfo = async (req, res) => {
  try {
    // Get the first restaurant (we only have one in this app)
    const restaurant = await prisma.restaurant.findFirst();
    
    // Get facilities
    const facilities = await prisma.facility.findMany();
    
    return res.status(200).json({
      success: true,
      data: {
        restaurant,
        facilities
      }
    });
  } catch (error) {
    console.error('Get restaurant info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update restaurant information
const updateRestaurantInfo = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      const {
        name,
        description,
        address,
        phone,
        email,
        ownerName,
        ownerQuote
      } = req.body;
      
      // Get the first restaurant or create if not exists
      let restaurant = await prisma.restaurant.findFirst();
      
      // Prepare update data
      const updateData = {};
      
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (address) updateData.address = address;
      if (phone) updateData.phone = phone;
      if (email) updateData.email = email;
      if (ownerName) updateData.ownerName = ownerName;
      if (ownerQuote) updateData.ownerQuote = ownerQuote;
      
      // Process restaurant image if uploaded
      if (req.files && req.files.image) {
        // Delete old image if exists
        if (restaurant && restaurant.image) {
          const oldImagePath = path.join(__dirname, '../..', restaurant.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        updateData.image = `/uploads/restaurant/${req.files.image[0].filename}`;
      }
      
      // Process owner image if uploaded
      if (req.files && req.files.ownerImage) {
        // Delete old image if exists
        if (restaurant && restaurant.ownerImage) {
          const oldImagePath = path.join(__dirname, '../..', restaurant.ownerImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        updateData.ownerImage = `/uploads/owner/${req.files.ownerImage[0].filename}`;
      }
      
      if (restaurant) {
        // Update restaurant
        restaurant = await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: updateData
        });
      } else {
        // Create restaurant
        restaurant = await prisma.restaurant.create({
          data: {
            name: name || 'AmbatoEat',
            description: description || 'A modern restaurant with delicious food.',
            address: address || 'Jakarta, Indonesia',
            phone: phone || '+62 123 456 7890',
            email: email || 'info@ambatoeat.com',
            ownerName: ownerName,
            ownerQuote: ownerQuote,
            image: updateData.image,
            ownerImage: updateData.ownerImage
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Restaurant information updated successfully',
        data: restaurant
      });
    });
  } catch (error) {
    console.error('Update restaurant info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add a facility
const addFacility = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }
    
    // Create new facility
    const newFacility = await prisma.facility.create({
      data: {
        name,
        description,
        image: null // We can add image upload functionality later
      }
    });
    
    return res.status(201).json({
      success: true,
      message: 'Facility added successfully',
      data: newFacility
    });
  } catch (error) {
    console.error('Add facility error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a facility
const deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the facility exists
    const facility = await prisma.facility.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }
    
    // Delete the facility
    await prisma.facility.delete({
      where: { id: parseInt(id) }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Facility deleted successfully'
    });
  } catch (error) {
    console.error('Delete facility error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getRestaurantInfo,
  updateRestaurantInfo,
  addFacility,
  deleteFacility
};