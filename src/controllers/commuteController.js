const commute = require("../models/commute");

//CREATE COMMUTE
const createCommute = async (req, res) => {
    try{
        const {
            route,
            schedule,
            pickupPoints,
            preferences,
        } = req.body;

        const commute = await commute.create ({
            user: req.user._id,
            route,
            schedule,
            pickupPoints,
            preferences,
        });
        res.status(201).json({
            message: "Recurring commute created successfully",
            commute,
        });
    }catch(error) {
        res.status(400).json({
            message: "Failed to create recurring commute",
            error: error.message
        });
    }
};

//GET MYCOMMUTES
const getMyCommutes = async (req, res) => {
    try{
        const commute = await commute.find({
        user: req.user._id,
        });

        if(commute.length === 0){
            return res.status(404).json({
                message: "No commutes found",
            });
        }
        return res.status(200).json({
            message: "Commutes retrieved successfully ",
            commute,
        });
    }catch(error){
        return res.status(500).json({
            message: "Failed to retrieve commutes",
            error: error.message
        });
    }
};

//GET ONE COMMUTE
const getCommuteById = async (req, res) => {
    try{
        const commute = await commute.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate("user", "firstName lastName email verificationStatus")

        if(!commute) {
            return res.status(404).json({
             message:   "Specified commute not found",
            });
        }
        return res.status(200),json({
            message: "commute retrieved successfully",
            commute
        });
    }catch(error){
        return res.status(500).json({
            message: "Failed to retrieve commute",
            error: error.message,
        })
    }
};

//UPDATE COMMUTE
const updateCommute = async (req, res) => {
    try{
        const {
            route,
            schedule,
            pickupPoints,
            preferences,
            isActive,
        } = req.body

        const commute = await commute.findOneAndUpdate(
            {
            _id : req.params.id,
            user: req.user._id,
        },
        {
            route,
            schedule,
            pickupPoints,
            isActive,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if(!commute){
        return res.status(404).json({
            message: "Commute to be updated is not found",
        });
    }

    return res.status(200).json({
        message: "Commute updated successfully",
        commute,
    });

    }catch(error){
        return res.status(500).jso({
            message: " Failed to update commute",
            error: error.message,
        });
    }
};

//DEACTIVATE COMMUTE
const deactivateCommute = async (req, res) => {
    try{
        const commute = await commute.findOneAndUpdate(
            {
                _id: req.params.id,
                user: re.user._id,
            },
            {
                isActive: false,
            },
            {
                new : true,
                runValidators:true,
            }
        );

        if(!commute){
            return res.status(404)({
              message:  "Commute to be deactivated is not found",
            });
        }

        return res.status(200).json ({
            message: "Commute deactivated successfully",
            commute,
        })
    }catch(error){
        return res.status(500).json({
            message: " Failed to deactivate commute",
            error: error.message,
        });
    }
};

module.exports = {createCommute,
    getMyCommutes,
    getCommuteById,
    updateCommute,
    deactivateCommute,
}