import User from "@/models/User";

/**
 * Check if a user is an admin
 * @param {string} userId - The user's ID to check
 * @returns {Promise<boolean>} - True if admin, false otherwise
 */
export async function isUserAdmin(userId) {
  if (!userId || userId === "anonymous") return false;
  try {
    const user = await User.findById(userId).select("role");
    return user?.role === "admin";
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
}

/**
 * Get a list of all admin user IDs
 * @returns {Promise<string[]>} - Array of admin user IDs
 */
export async function getAdminUserIds() {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    return adminUsers.map((user) => user._id.toString());
  } catch (error) {
    console.error("Error getting admin user IDs:", error);
    return [];
  }
}

/**
 * Check if a path is an admin path
 * @param {string} path - The path to check
 * @returns {boolean} - True if admin path, false otherwise
 */
export function isAdminPath(path) {
  if (!path) return false;
  return path.startsWith("/admin");
}

/**
 * Build a filter object for analytics queries to exclude admin data
 * @param {Object} baseFilters - Base filters to apply
 * @param {string[]} adminIds - List of admin user IDs to exclude
 * @returns {Object} - Filter object for MongoDB queries
 */
export function buildAnalyticsFilters(baseFilters = {}, adminIds = []) {
  return {
    ...baseFilters,
    page: { $not: /^\/admin.*/ },
    userId: { $nin: adminIds },
  };
}

/**
 * Pure function to check if we should track this user/path combination
 * @param {Object} user - The user object
 * @param {string} path - The current path
 * @returns {boolean} - True if we should track, false otherwise
 */
export function shouldTrackAnalytics(user, path) {
  if (!path) return false;
  if (path.startsWith("/admin")) return false;
  if (user?.role === "admin") return false;
  return true;
}
