const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/menu');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'menu-' + uniqueSuffix + ext);
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
}).single('image');

// Create a new menu item
const createMenuItem = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      const { name, description, price, category, image } = req.body;

      // Validate required fields
      if (!name || !description || !price || !category  || !image) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, price, and category are required'
        });
      }
      

      // Create new menu item
      const newMenuItem = await prisma.menuItem.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          category,
          image
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: newMenuItem
      });
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: {
        category: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Get all menu items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get menu items by category
const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['FOOD', 'DRINK', 'DESSERT'];
    
    if (!validCategories.includes(category.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be FOOD, DRINK, or DESSERT'
      });
    }
    
    const menuItems = await prisma.menuItem.findMany({
      where: {
        category: category.toUpperCase()
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Get menu items by category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a menu item (Modified for URL image)
const updateMenuItem = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { id } = req.params;
      const { name, description, price, category } = req.body;
      const image = req.file ? `/uploads/menu/${req.file.filename}` : null;

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: parseInt(id) }
      });

      if (!menuItem) {
        return res.status(404).json({ success: false, message: 'Menu item not found' });
      }

      const updatedMenuItem = await prisma.menuItem.update({
        where: { id: parseInt(id) },
        data: {
          name: name || menuItem.name,
          description: description || menuItem.description,
          price: price ? parseFloat(price) : menuItem.price,
          category: category || menuItem.category,
          image: image || menuItem.image
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Menu item updated successfully',
        data: updatedMenuItem
      });

    } catch (error) {
      console.error('Update menu item error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  });
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the menu item exists
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Delete image if exists
    if (menuItem.image) {
      const imagePath = path.join(__dirname, '../..', menuItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete the menu item
    await prisma.menuItem.delete({
      where: { id: parseInt(id) }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuItemsByCategory,
  updateMenuItem,
  deleteMenuItem
};