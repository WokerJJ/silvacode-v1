// middlewares/errorHandler.js
//
// Express reconoce este middleware como "manejador de errores" porque recibe
// 4 parámetros (err primero). Cualquier controller que llame a next(err) —
// como hacen todos los try/catch de este proyecto — termina cayendo acá.
// Se registra al final de app.js, después de todas las rutas.
export default function errorHandler(err, req, res, next) {
    console.error(err); // el detalle completo solo queda en la consola del servidor

    // err.message puede revelar de más (nombres de tabla, columnas, rutas internas)
    // si algún día esto corre en producción, así que solo se lo devolvemos al
    // cliente en desarrollo. En producción el cliente solo ve "Internal server error".
    const isDev = process.env.NODE_ENV !== "production";
    res.status(500).json({
        error: "Internal server error",
        ...(isDev && { message: err.message }),
    });
}
