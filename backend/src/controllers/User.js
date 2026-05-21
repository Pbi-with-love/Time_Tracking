import {getUserDetailService} from "../services/User/userDetails.Service.js";

export const getUserDetailController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userDetails = await getUserDetailService(userId);
        return res.status(200).json({ userDetails })
    } catch (err) {
        next(err);
    }
}