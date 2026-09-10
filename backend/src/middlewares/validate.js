import { ZodError } from "zod";

// Middleware "fábrica": se le pasa un schema por ruta (ver routes/*.js) y devuelve
// el middleware real de Express. Guarda el resultado validado en req.validatedBody/
// Params/Query en vez de sobrescribir req.body/params directamente — así queda claro,
// leyendo cualquier controller, si ese dato ya pasó por Zod o no. IMPORTANTE: los
// controllers deben leer siempre req.validatedX, nunca req.body/req.params a secas,
// o se saltan toda la validación sin darse cuenta.
const validate = (schema) => (req, res, next) => {
    try {
        if (schema.body) req.validatedBody = schema.body.parse(req.body);
        if (schema.query) req.validatedQuery = schema.query.parse(req.query);
        if (schema.params) req.validatedParams = schema.params.parse(req.params);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // En Zod v4 la lista de errores está en `.issues`, no en `.errors`
            // (que sí existía en v3). Usar `.errors` acá hacía que CUALQUIER
            // validación fallida crasheara con 500 en vez de devolver un 400
            // limpio — bug real que destapó el primer test que probó este
            // camino end-to-end.
            return res.status(400).json({
                error: "Validation failed",
                details: err.issues.map(e => ({
                    path: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        next(err);
    }
};
export default validate;