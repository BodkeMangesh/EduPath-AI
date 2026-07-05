const DashboardService = require("../services/DashboardService");

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const { careerId } = req.query;

      const dashboard = await DashboardService.getDashboard(
        req.user._id,
        careerId,
      );

      return res.status(200).json({
        success: true,

        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
