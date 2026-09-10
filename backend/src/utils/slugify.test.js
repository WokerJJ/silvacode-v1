import { test } from "node:test";
import assert from "node:assert/strict";
import slugify from "./slugify.js";

// Reemplaza al viejo test-slugify.js (script manual que había que correr a
// mano y leer los ✅/❌ por consola) por tests reales conectados a `npm test`.
const cases = [
    ["Hola Mundo", "hola-mundo"],
    ["  Espacios   extras  ", "espacios-extras"],
    ["Café & Té", "cafe-and-te"],
    ["Mi jardín & huerto 2025!!", "mi-jardin-and-huerto-2025"],
    ["React---Express", "react-express"],
    ["Árbol Ñandú", "arbol-nandu"],
];

for (const [input, expected] of cases) {
    test(`slugify("${input}") -> "${expected}"`, () => {
        assert.equal(slugify(input), expected);
    });
}
