import "./setup.js";
import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma.js";
import { resetDb } from "./helpers.js";

before(resetDb);
beforeEach(resetDb);
after(async () => {
    await resetDb();
    await prisma.$disconnect();
});

test("POST /auth/register crea un usuario y nunca devuelve el password", async () => {
    const res = await request(app)
        .post("/auth/register")
        .send({ username: "alice", email: "alice@example.com", password: "abc12345" });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, "alice@example.com");
    assert.equal(res.body.user.password, undefined);
});

test("POST /auth/register rechaza un password que no cumple las reglas", async () => {
    const res = await request(app)
        .post("/auth/register")
        .send({ username: "alice", email: "alice@example.com", password: "soloLetras" });

    assert.equal(res.status, 400);
});

test("POST /auth/login con credenciales correctas devuelve un token", async () => {
    await request(app)
        .post("/auth/register")
        .send({ username: "alice", email: "alice@example.com", password: "abc12345" });

    const res = await request(app)
        .post("/auth/login")
        .send({ email: "alice@example.com", password: "abc12345" });

    assert.equal(res.status, 200);
    assert.equal(typeof res.body.token, "string");
});

test("POST /auth/login con password incorrecto es rechazado", async () => {
    await request(app)
        .post("/auth/register")
        .send({ username: "alice", email: "alice@example.com", password: "abc12345" });

    const res = await request(app)
        .post("/auth/login")
        .send({ email: "alice@example.com", password: "otraCosa123" });

    assert.equal(res.status, 400);
    assert.equal(res.body.token, undefined);
});

test("POST /auth/login con email que no existe es rechazado", async () => {
    const res = await request(app)
        .post("/auth/login")
        .send({ email: "nadie@example.com", password: "abc12345" });

    assert.equal(res.status, 400);
});

test("POST /auth/logout invalida el token: pedidos posteriores con ese mismo token son rechazados", async () => {
    await request(app)
        .post("/auth/register")
        .send({ username: "alice", email: "alice@example.com", password: "abc12345" });
    const login = await request(app)
        .post("/auth/login")
        .send({ email: "alice@example.com", password: "abc12345" });

    const logoutRes = await request(app)
        .post("/auth/logout")
        .set("Authorization", `Bearer ${login.body.token}`);
    assert.equal(logoutRes.status, 204);

    const afterLogout = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${login.body.token}`);
    assert.equal(afterLogout.status, 403);
});

test("cerrar sesión de un token no afecta a otro token distinto del mismo usuario", async () => {
    await request(app)
        .post("/auth/register")
        .send({ username: "alice", email: "alice@example.com", password: "abc12345" });
    const session1 = await request(app)
        .post("/auth/login")
        .send({ email: "alice@example.com", password: "abc12345" });
    const session2 = await request(app)
        .post("/auth/login")
        .send({ email: "alice@example.com", password: "abc12345" });

    await request(app)
        .post("/auth/logout")
        .set("Authorization", `Bearer ${session1.body.token}`);

    const stillWorks = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${session2.body.token}`);
    assert.equal(stillWorks.status, 200);
});

test("las respuestas incluyen los headers de seguridad de helmet", async () => {
    const res = await request(app).get("/api");
    assert.equal(res.headers["x-content-type-options"], "nosniff");
});
