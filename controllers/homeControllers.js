const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Home route working successfully"
    });
});
