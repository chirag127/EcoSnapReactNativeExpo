import User from "../models/User.js";

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user && user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ error: "Admin access required" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};