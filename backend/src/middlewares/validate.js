import { ZodError } from "zod";

const validate = (schema) => (req, res, next) => {
    try {
        if (schema.body) req.validatedBody = schema.body.parse(req.body);
        if (schema.query) req.validatedQuery = schema.query.parse(req.query);
        if (schema.params) req.validatedParams = schema.params.parse(req.params);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({
                error: "Validation failed",
                details: err.errors.map(e => ({
                    path: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        next(err);
    }
};
export default validate;