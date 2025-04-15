const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new reservation
const createReservation = async (req, res) => {
  try {
    const { tableId, reservationDate } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!tableId || !reservationDate) {
      return res.status(400).json({
        success: false,
        message: 'Table ID and reservation date are required'
      });
    }

    // Check if the table exists
    const table = await prisma.table.findUnique({
      where: { id: parseInt(tableId) }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Check if the table is available
    if (table.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'Table is not available'
      });
    }

    // Parse the reservation date
    const parsedReservationDate = new Date(reservationDate);

    // Check if the table is already reserved for the requested date
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        tableId: parseInt(tableId),
        reservationDate: parsedReservationDate,
        status: 'ACTIVE'
      }
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'Table is already reserved for this date'
      });
    }

    // Create new reservation
    const newReservation = await prisma.reservation.create({
      data: {
        userId: userId,
        tableId: parseInt(tableId),
        reservationDate: parsedReservationDate,
        status: 'ACTIVE'
      },
      include: {
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Update table status to RESERVED
    await prisma.table.update({
      where: { id: parseInt(tableId) },
      data: { status: 'RESERVED' }
    });

    return res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: newReservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all reservations (admin)
const getAllReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        reservationDate: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Get all reservations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's reservations
const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: userId,
        deletedAt: null
      },
      include: {
        table: true
      },
      orderBy: {
        reservationDate: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Get user reservations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Soft delete a reservation (user)
const softDeleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if the reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // If the user is not an admin, check if the reservation belongs to them
    if (userRole !== 'ADMIN' && reservation.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This reservation does not belong to you'
      });
    }

    // Soft delete the reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(), // Mark as deleted
        status: 'COMPLETED'     // Change status to 'COMPLETED'
      }
    });

    // Update table status to AVAILABLE
    await prisma.table.update({
      where: { id: reservation.tableId },
      data: { status: 'AVAILABLE' }
    });

    return res.status(200).json({
      success: true,
      message: 'Reservation canceled successfully',
      data: updatedReservation
    });
  } catch (error) {
    console.error('Soft delete reservation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Hard delete a reservation (admin)
const hardDeleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Delete the reservation
    await prisma.reservation.delete({
      where: { id: parseInt(id) }
    });

    // Update table status to AVAILABLE
    await prisma.table.update({
      where: { id: reservation.tableId },
      data: { status: 'AVAILABLE' }
    });

    return res.status(200).json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Hard delete reservation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  getUserReservations,
  softDeleteReservation,
  hardDeleteReservation
};