const Career = require("../models/Career");
const CareerCategory = require("../models/CareerCategory");
const ApiError = require("../utils/ApiError");

class CareerService {
  /**
   * Get all active careers
   */
  static async getAllCareers(filters = {}) {
    const query = {
      isActive: true,
    };

    // Search by category slug
    if (filters.category) {
      const category = await CareerCategory.findOne({
        slug: filters.category,
        isActive: true,
      });

      if (category) {
        query.category = category._id;
      }
    }

    // Search by keyword
    if (filters.keyword) {
      query.$or = [
        {
          name: {
            $regex: filters.keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: filters.keyword,
            $options: "i",
          },
        },
      ];
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    const skip = (page - 1) * limit;

    const careers = await Career.find(query)
      .populate("category", "name slug icon")
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Career.countDocuments(query);

    return {
      careers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get career by slug
   */
  static async getCareerBySlug(slug) {
    const career = await Career.findOne({
      slug,
      isActive: true,
    }).populate("category");

    if (!career) {
      throw new ApiError(404, "Career not found.");
    }

    return career;
  }

  /**
   * Search careers
   */
  static async searchCareers(keyword) {
    return await Career.find({
      isActive: true,
      $or: [
        {
          name: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    }).populate("category");
  }

  /**
   * Get all active categories
   */
  static async getCategories() {
    return await CareerCategory.find({
      isActive: true,
    }).sort({ name: 1 });
  }

  /**
   * Dashboard statistics
   */
  static async getStatistics() {
    const totalCareers = await Career.countDocuments({
      isActive: true,
    });

    const totalCategories = await CareerCategory.countDocuments({
      isActive: true,
    });

    return {
      totalCareers,
      totalCategories,
    };
  }

  static async createCareer(data) {
    const category = await CareerCategory.findOne({
      slug: data.categorySlug,
      isActive: true,
    });

    if (!category) {
      throw new ApiError(404, "Career category not found.");
    }

    const career = await Career.create({
      ...data,
      category: category._id,
    });

    return career.populate("category", "name slug");
  }

  static async createCareer(data) {
    const { categorySlug, ...careerData } = data;

    const category = await CareerCategory.findOne({
      slug: categorySlug,
      isActive: true,
    });

    if (!category) {
      throw new ApiError(404, "Career category not found.");
    }

    const career = await Career.create({
      ...careerData,
      category: category._id,
    });

    return career.populate("category", "name slug");
  }

  static async updateCareer(id, data) {
    const { categorySlug, ...careerData } = data;

    if (categorySlug) {
      const category = await CareerCategory.findOne({
        slug: categorySlug,
        isActive: true,
      });

      if (!category) {
        throw new ApiError(404, "Career category not found.");
      }

      careerData.category = category._id;
    }

    const career = await Career.findByIdAndUpdate(id, careerData, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug icon");

    if (!career) {
      throw new ApiError(404, "Career not found.");
    }

    return career;
  }
  static async deleteCareer(id) {
    const career = await Career.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!career) {
      throw new ApiError(404, "Career not found.");
    }

    return career;
  }
}

module.exports = CareerService;
