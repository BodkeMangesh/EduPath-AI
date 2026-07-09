const DashboardService = require("../services/DashboardService");

const asyncHandler = require("../middleware/asyncHandler");

class DashboardController {
  getDashboard = asyncHandler(async (req, res) => {
    const { careerId } = req.query;

    const dashboard = await DashboardService.getDashboard(
      req.user._id,
      careerId,
    );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  });
}

module.exports = new DashboardController();
