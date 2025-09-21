// middlewares/errorHandler.js
export default function errorHandler(err, req, res, next) {
    console.error(err); // log útil
    res.status(500).json({
        error: "Internal server error",
        message: err.message,
    });
}
