const Expert = require('../models/Expert');

// GET /experts - with pagination, search, filter
const getExperts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 8,
      search = '',
      category = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { bio: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    const [experts, total] = await Promise.all([
      Expert.find(filter)
        .select('-availability')
        .sort({ rating: -1, totalSessions: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: experts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalExperts: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /experts/:id
const getExpertById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expert = await Expert.findById(id).lean();

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found',
      });
    }

    // Filter out past dates from availability
    const today = new Date().toISOString().split('T')[0];
    expert.availability = (expert.availability || [])
      .filter(avail => avail.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: expert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExperts, getExpertById };
