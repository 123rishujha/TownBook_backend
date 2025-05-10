const { BookModel } = require('../models/bookModel');
const ReservationModel = require('../models/ReservationModel');
const { UserModel } = require('../models/userModel');

/**
 * @desc    Get dashboard statistics for librarian
 * @route   GET /api/dashboard/stats
 * @access  Private/Librarian
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Check if user is a librarian
    if (req.user.role !== 'librarian') {
      const error = new Error('Not authorized, librarian access only');
      error.statusCode = 403;
      return next(error);
    }
    // Get total counts with error handling
    let totalBooks = 0;
    let totalMembers = 0;
    let totalReservations = 0;
    
    try {
      // Use length of results array instead of count method
      const books = await BookModel.find();
      totalBooks = books.length;
      
      const members = await UserModel.find({ role: 'member' });
      totalMembers = members.length;
      
      const reservations = await ReservationModel.find();
      totalReservations = reservations.length;
    } catch (error) {
      console.error('Error getting counts:', error);
      // Keep default zero values if queries fail
    }
    
    // Get books by category with manual grouping instead of aggregation
    let booksByCategory = [
      { _id: 'Fiction', count: 0 },
      { _id: 'Non-Fiction', count: 0 },
      { _id: 'Reference', count: 0 }
    ];
    
    try {
      // Get all books
      const books = await BookModel.find();
      
      // Manual grouping by category
      const categoryMap = {};
      
      books.forEach(book => {
        const category = book.category || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category]++;
      });
      
      // Convert to array format
      booksByCategory = Object.keys(categoryMap).map(category => ({
        _id: category,
        count: categoryMap[category]
      }));
      
      // Sort by count descending and limit to top 5
      booksByCategory.sort((a, b) => b.count - a.count);
      booksByCategory = booksByCategory.slice(0, 5);
      
      // If no categories found, keep the default data
      if (booksByCategory.length === 0) {
        booksByCategory = [
          { _id: 'Fiction', count: 0 },
          { _id: 'Non-Fiction', count: 0 },
          { _id: 'Reference', count: 0 }
        ];
      }
    } catch (error) {
      console.error('Error processing book categories:', error);
      // Keep default categories if there's an error
    }
    
    // Get reservation status counts with manual grouping
    let reservationStatusCounts = [
      { _id: 'pending', count: 0 },
      { _id: 'confirmed', count: 0 },
      { _id: 'cancelled', count: 0 }
    ];
    
    try {
      // Get all reservations
      const reservations = await ReservationModel.find();
      
      // Manual grouping by status
      const statusMap = {
        pending: 0,
        confirmed: 0,
        cancelled: 0
      };
      
      reservations.forEach(reservation => {
        const status = reservation.status || 'pending';
        if (statusMap[status] !== undefined) {
          statusMap[status]++;
        }
      });
      
      // Convert to array format
      reservationStatusCounts = Object.keys(statusMap).map(status => ({
        _id: status,
        count: statusMap[status]
      }));
      
      // If no statuses found, keep the default data
      if (reservationStatusCounts.length === 0) {
        reservationStatusCounts = [
          { _id: 'pending', count: 0 },
          { _id: 'confirmed', count: 0 },
          { _id: 'cancelled', count: 0 }
        ];
      }
    } catch (error) {
      console.error('Error processing reservation statuses:', error);
      // Keep default statuses if there's an error
    }
    
    // Get recent reservations with error handling
    let recentReservations = [];
    try {
      // Get all reservations and sort manually
      const allReservations = await ReservationModel.find().populate('memberUserId');
      
      // Sort by createdAt (newest first) and limit to 5
      recentReservations = allReservations
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting recent reservations:', error);
      // Keep empty array if there's an error
    }
    
    // Get monthly reservation data for chart using actual reservations
    const currentYear = new Date().getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let chartData = Array(12).fill(0);
    
    try {
      // Use the reservations we already have from the previous query
      const allReservations = await ReservationModel.find();
      console.log(`Found ${allReservations.length} total reservations`);
      
      // Group reservations by month
      allReservations.forEach(reservation => {
        if (reservation.date) {
          try {
            const reservationDate = new Date(reservation.date);
            const month = reservationDate.getMonth(); // 0-based month index
            
            // Increment the count for this month
            if (month >= 0 && month < 12) {
              chartData[month]++;
            }
          } catch (dateError) {
            console.error('Error parsing reservation date:', dateError);
          }
        }
      });
      
      console.log('Monthly reservation data:', chartData);
      // No sample data - only show actual data
    } catch (error) {
      console.error('Error generating monthly reservation data:', error);
      // Keep the default zero-filled array if there's an error
    }
    
    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalBooks,
          totalMembers,
          totalReservations,
          totalIssues: 0 // Placeholder since we don't have the issue model
        },
        booksByCategory,
        reservationStatusCounts,
        recentReservations,
        recentIssues: [], // Empty array since we don't have the issue model
        chartData: {
          labels: monthNames,
          data: chartData
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
