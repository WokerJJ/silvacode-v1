import "./setup.js";
import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma.js";
import { resetDb, createTestUser } from "./helpers.js";

// Estos tests existen para que el IDOR que se corrigió en gardensController.js
// (comparar garden.user_id contra req.user.userId, nunca contra un id que
// mande el cliente) no se vuelva a colar por accidente en un refactor futuro.

let alice, bob;

before(resetDb);
beforeEach(async () => {
    await resetDb();
    alice = await createTestUser(request, app, { username: "alice", email: "alice@example.com" });
    bob = await createTestUser(request, app, { username: "bob", email: "bob@example.com" });
});
after(async () => {
    await resetDb();
    await prisma.$disconnect();
});

test("un usuario autenticado puede crear su propio jardín", async () => {
    const res = await request(app)
        .post("/api/gardens")
        .set("Authorization", `Bearer ${alice.token}`)
        .send({ name: "Mi jardín" });

    assert.equal(res.status, 201);
    assert.equal(res.body.user_id, alice.id);
    assert.equal(res.body.slug, "mi-jardin"); // generado automáticamente
});

test("crear un jardín ignora un user_id falsificado en el body", async () => {
    const res = await request(app)
        .post("/api/gardens")
        .set("Authorization", `Bearer ${alice.token}`)
        .send({ name: "Jardín de Alice", user_id: bob.id });

    assert.equal(res.status, 201);
    assert.equal(res.body.user_id, alice.id); // no bob.id
});

test("sin token, /api/gardens responde 401", async () => {
    const res = await request(app).post("/api/gardens").send({ name: "x" });
    assert.equal(res.status, 401);
});

test("bob NO puede ver el jardín de alice (403)", async () => {
    const garden = await request(app)
        .post("/api/gardens")
        .set("Authorization", `Bearer ${alice.token}`)
        .send({ name: "Jardín privado de Alice" });

    const res = await request(app)
        .get(`/api/gardens/${garden.body.id}`)
        .set("Authorization", `Bearer ${bob.token}`);

    assert.equal(res.status, 403);
});

test("bob NO puede modificar el jardín de alice (403) y el nombre no cambia", async () => {
    const garden = await request(app)
        .post("/api/gardens")
        .set("Authorization", `Bearer ${alice.token}`)
        .send({ name: "Jardín de Alice" });

    const res = await request(app)
        .put(`/api/gardens/${garden.body.id}`)
        .set("Authorization", `Bearer ${bob.token}`)
        .send({ name: "Hackeado por bob" });

    assert.equal(res.status, 403);

    const stillAlices = await prisma.gardens.findUnique({ where: { id: garden.body.id } });
    assert.equal(stillAlices.name, "Jardín de Alice");
});

test("bob NO puede eliminar el jardín de alice (403) y el jardín sigue existiendo", async () => {
    const garden = await request(app)
        .post("/api/gardens")
        .set("Authorization", `Bearer ${alice.token}`)
        .send({ name: "Jardín de Alice" });

    const res = await request(app)
        .delete(`/api/gardens/${garden.body.id}`)
        .set("Authorization", `Bearer ${bob.token}`);

    assert.equal(res.status, 403);

    const stillExists = await prisma.gardens.findUnique({ where: { id: garden.body.id } });
    assert.notEqual(stillExists, null);
});

test("alice SÍ puede ver, modificar y borrar su propio jardín", async () => {
    const garden = await request(app)
        .post("/api/gardens")
        .set("Authorization", `Bearer ${alice.token}`)
        .send({ name: "Jardín de Alice" });

    const getRes = await request(app)
        .get(`/api/gardens/${garden.body.id}`)
        .set("Authorization", `Bearer ${alice.token}`);
    assert.equal(getRes.status, 200);

    const putRes = await request(app)
        .put(`/api/gardens/${garden.body.id}`)
        .set("Authorization", `Bearer ${alice.token}`)
        .send({ name: "Jardín renovado" });
    assert.equal(putRes.status, 200);
    assert.equal(putRes.body.name, "Jardín renovado");

    const deleteRes = await request(app)
        .delete(`/api/gardens/${garden.body.id}`)
        .set("Authorization", `Bearer ${alice.token}`);
    assert.equal(deleteRes.status, 204);
});

test("GET a un jardín que no existe responde 404", async () => {
    const res = await request(app)
        .get("/api/gardens/999999")
        .set("Authorization", `Bearer ${alice.token}`);
    assert.equal(res.status, 404);
});
