import { test } from "node:test";
import assert from "node:assert/strict";
import { registerSchema, loginSchema } from "./authSchema.js";
import { createGardenSchema, updateGardenSchema } from "./gardenSchema.js";
import { createUserSchema, userIdSchema } from "./userSchema.js";
import { idSchema } from "./idSchema.js";

test("registerSchema acepta datos válidos", () => {
    const result = registerSchema.safeParse({
        username: "alice",
        email: "alice@example.com",
        password: "abc12345",
    });
    assert.equal(result.success, true);
});

test("registerSchema rechaza password sin número", () => {
    const result = registerSchema.safeParse({
        username: "alice",
        email: "alice@example.com",
        password: "abcdefgh",
    });
    assert.equal(result.success, false);
});

test("registerSchema rechaza email inválido", () => {
    const result = registerSchema.safeParse({
        username: "alice",
        email: "no-es-un-email",
        password: "abc12345",
    });
    assert.equal(result.success, false);
});

test("loginSchema rechaza password corto", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "123" });
    assert.equal(result.success, false);
});

test("createGardenSchema: slug es opcional", () => {
    const result = createGardenSchema.safeParse({ name: "Mi jardín" });
    assert.equal(result.success, true);
});

test("createGardenSchema rechaza slug con mayúsculas o espacios", () => {
    const result = createGardenSchema.safeParse({ name: "Mi jardín", slug: "Mi Jardin" });
    assert.equal(result.success, false);
});

test("updateGardenSchema acepta objeto vacío (todo opcional)", () => {
    const result = updateGardenSchema.safeParse({});
    assert.equal(result.success, true);
});

test("createUserSchema exige password (bug ya corregido: antes no lo pedía)", () => {
    const result = createUserSchema.safeParse({
        username: "bob",
        email: "bob@example.com",
    });
    assert.equal(result.success, false);
});

test("userIdSchema rechaza un id que no es UUID", () => {
    const result = userIdSchema.safeParse({ id: "123" });
    assert.equal(result.success, false);
});

test("idSchema convierte un id numérico en string a number", () => {
    const result = idSchema.safeParse({ id: "42" });
    assert.equal(result.success, true);
    assert.equal(result.data.id, 42);
});

test("idSchema rechaza ids negativos o no numéricos", () => {
    assert.equal(idSchema.safeParse({ id: "-1" }).success, false);
    assert.equal(idSchema.safeParse({ id: "abc" }).success, false);
});
