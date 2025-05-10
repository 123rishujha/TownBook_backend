// Dashboard controller for member dashboard APIs

// Placeholder: Replace with real DB queries
exports.getMemberOverview = async (req, res) => {
  // Example: Fetch counts and recent notifications
  res.json({
    name: "Alex Johnson",
    activeBookReservations: 2,
    roomBookings: 1,
    pendingRequests: 1,
    notifications: [
      {
        _id: "notif1",
        message: "Your reservation for 'The Great Gatsby' is due tomorrow",
        date: "2025-05-09",
        read: false,
      },
      {
        _id: "notif2",
        message: "Room reservation for Study Room B has been approved",
        date: "2025-05-06",
        read: true,
      },
    ],
  });
};

exports.getMemberReservations = async (req, res) => {
  // Example: Fetch all reservations for the member
  res.json([
    {
      _id: "res1",
      type: "book",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      status: "approved",
      dueDate: "2025-05-20",
      reservedDate: "2025-05-05",
    },
    {
      _id: "res2",
      type: "room",
      roomName: "Study Room B",
      status: "pending",
      date: "2025-05-15",
      SlotStartTime: "14:00",
      SlotEndTime: "16:00",
      librarianUserId: { name: "Emma Davis" },
    },
  ]);
};

exports.getMemberHistory = async (req, res) => {
  // Example: Fetch borrowing/room history for the member
  res.json([
    {
      _id: "hist1",
      type: "book",
      title: "1984",
      author: "George Orwell",
      borrowedDate: "2025-04-01",
      returnedDate: "2025-04-15",
    },
    {
      _id: "hist2",
      type: "room",
      roomName: "Study Room A",
      date: "2025-04-10",
      timeSlot: "13:00 - 15:00",
    },
  ]);
};

exports.getMemberNotifications = async (req, res) => {
  // Example: Fetch notifications for the member
  res.json([
    {
      _id: "notif1",
      message: "Your reservation for 'The Great Gatsby' is due tomorrow",
      date: "2025-05-09",
      read: false,
    },
    {
      _id: "notif2",
      message: "Room reservation for Study Room B has been approved",
      date: "2025-05-06",
      read: true,
    },
  ]);
};
