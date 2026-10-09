const Career = require("../models/Career");
const CareerCategory = require("../models/CareerCategory");
const ApiError = require("../utils/ApiError");

class CareerService {
  static normalizeCareerId(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  static async getAllCareers(filters = {}) {
    const query = {
      isActive: true,
    };

    if (filters.category) {
      const category = await CareerCategory.findOne({
        slug: filters.category,
        isActive: true,
      });

      if (category) {
        query.category = category._id;
      }
    }

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

  static async searchCareers(keyword) {
    if (!keyword || !String(keyword).trim()) {
      return [];
    }

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
        {
          skills: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    }).populate("category");
  }

  static async getCategories() {
    return await CareerCategory.find({
      isActive: true,
    }).sort({ name: 1 });
  }

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
    const { categorySlug, careerId, name, slug, ...careerData } = data;

    const category = await CareerCategory.findOne({
      slug: categorySlug,
      isActive: true,
    });

    if (!category) {
      throw new ApiError(404, "Career category not found.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId || name);

    if (!normalizedCareerId) {
      throw new ApiError(400, "A valid career ID is required.");
    }

    const existingCareer = await Career.findOne({
      $or: [{ careerId: normalizedCareerId }, { slug }],
    });

    if (existingCareer) {
      throw new ApiError(
        409,
        "A career with this career ID or slug already exists.",
      );
    }

    const career = await Career.create({
      name,
      careerId: normalizedCareerId,
      slug,
      ...careerData,
      category: category._id,
    });

    return await career.populate("category", "name slug icon");
  }

  static async updateCareer(id, data) {
    const { categorySlug, careerId, name, slug, ...careerData } = data;

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

    if (careerId !== undefined) {
      careerData.careerId = this.normalizeCareerId(careerId);
    }

    if (name !== undefined) {
      careerData.name = name;
    }

    if (slug !== undefined) {
      careerData.slug = slug;
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

  static async createCategory(data) {
    const { name, slug, description, icon } = data;

    const existingCategory = await CareerCategory.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      throw new ApiError(
        409,
        "A career category with this name or slug already exists.",
      );
    }

    return await CareerCategory.create({
      name,
      slug,
      description: description || "",
      icon: icon || "",
    });
  }

  static async someMethod() {
    return {
      message: "Career service is working correctly.",
    };
  }
}

module.exports = CareerService;
