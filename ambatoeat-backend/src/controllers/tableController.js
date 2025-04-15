const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new table
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    // Validate required fields
    if (!tableNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Table number and capacity are required'
      });
    }

    // Check if table number already exists
    const existingTable = await prisma.table.findUnique({
      where: { tableNumber: parseInt(tableNumber) }
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: 'Table number already exists'
      });
    }

    // Create new table
    const newTable = await prisma.table.create({
      data: {
        tableNumber: parseInt(tableNumber),
        capacity: parseInt(capacity),
        status: 'AVAILABLE'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: newTable
    });
  } catch (error) {
    console.error('Create table error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all tables
const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: {
        tableNumber: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: tables
    });
  } catch (error) {
    console.error('Get all tables error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get available tables for a specific date
const getAvailableTables = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const reservationDate = new Date(date);

    // Get all tables
    const allTables = await prisma.table.findMany({
      orderBy: {
        tableNumber: 'asc'
      }
    });

    // Get tables that are reserved for the specified date
    const reservedTableIds = await prisma.reservation.findMany({
      where: {
        reservationDate: reservationDate,
        status: 'ACTIVE',
        deletedAt: null
      },
      select: {
        tableId: true
      }
    });

    // Filter out reserved tables
    const reservedIds = reservedTableIds.map(item => item.tableId);
    const availableTables = allTables.filter(table => 
      !reservedIds.includes(table.id) && table.status !== 'MAINTENANCE'
    );

    return res.status(200).json({
      success: true,
      data: availableTables
    });
  } catch (error) {
    console.error('Get available tables error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a table
const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, status } = req.body;

    // Check if the table exists
    const table = await prisma.table.findUnique({
      where: { id: parseInt(id) }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Prepare update data
    const updateData = {};

    if (tableNumber) {
      // Check if the new table number already exists
      if (tableNumber !== table.tableNumber) {
        const existingTable = await prisma.table.findUnique({
          where: { tableNumber: parseInt(tableNumber) }
        });

        if (existingTable) {
          return res.status(400).json({
            success: false,
            message: 'Table number already exists'
          });
        }
      }
      
      updateData.tableNumber = parseInt(tableNumber);
    }
    
    if (capacity) updateData.capacity = parseInt(capacity);
    if (status) updateData.status = status;

    // Update table
    const updatedTable = await prisma.table.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Table updated successfully',
      data: updatedTable
    });
  } catch (error) {
    console.error('Update table error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a table
const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the table exists
    const table = await prisma.table.findUnique({
      where: { id: parseInt(id) }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Check if the table has active reservations
    const activeReservations = await prisma.reservation.findFirst({
      where: {
        tableId: parseInt(id),
        status: 'ACTIVE',
        deletedAt: null
      }
    });

    if (activeReservations) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete table with active reservations'
      });
    }

    // Delete the table
    await prisma.table.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Delete table error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createTable,
  getAllTables,
  getAvailableTables,
  updateTable,
  deleteTable
};