// Fuerza NODE_ENV=test ANTES de que cualquier test importe app.js. Como los
// imports de ES modules se ejecutan en el orden en que aparecen (ver la nota
// en src/env.js sobre hoisting), cada archivo de test debe importar este
// setup.js como su PRIMER import, así:
//
//   import "./setup.js";
//   import app from "../src/app.js";
//
// Si el import de app.js va primero, env.js ya habría cargado .env (el de
// desarrollo) para cuando este archivo corra, y los tests terminarían
// pegándole a la base de datos real en vez de a silvacode_test.
process.env.NODE_ENV = "test";
