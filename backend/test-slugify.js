import slugify from "./src/utils/slugify.js";

function testSlugify() {
    const tests = [
        { input: "Hola Mundo", expected: "hola-mundo" },
        { input: "  Espacios   extras  ", expected: "espacios-extras" },
        { input: "Café & Té", expected: "cafe-and-te" },
        { input: "Mi jardín & huerto 2025!!", expected: "mi-jardin-and-huerto-2025" },
        { input: "React---Express", expected: "react-express" },
        { input: "Árbol Ñandú", expected: "arbol-nandu" }, // ojo: slugify no quita tildes
    ];

    let passed = 0;

    tests.forEach(({ input, expected }, i) => {
        const result = slugify(input);
        if (result === expected) {
            console.log(`✅ Test ${i + 1} OK: "${input}" -> "${result}"`);
            passed++;
        } else {
            console.error(`❌ Test ${i + 1} FAIL: "${input}" -> "${result}", esperado "${expected}"`);
        }
    });

    console.log(`\n${passed}/${tests.length} tests pasaron.`);
}

testSlugify();
