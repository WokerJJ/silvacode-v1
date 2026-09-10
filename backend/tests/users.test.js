import "./setup.js";
import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/prisma.js";
import { resetDb, createTestUser } from "./helpers.js";

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

test("GET /api/users nunca incluye el password de nadie", async () => {
    const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${alice.token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.length >= 2);
    for (const user of res.body) {
        assert.equal(user.password, undefined);
    }
});

test("bob NO puede actualizar la cuenta de alice (403) y los datos no cambian", async () => {
    const res = await request(app)
        .put(`/api/users/${alice.id}`)
        .set("Authorization", `Bearer ${bob.token}`)
        .send({ username: "hackeado" });

    assert.equal(res.status, 403);

    const stillAlice = await prisma.users.findUnique({ where: { id: alice.id } });
    assert.equal(stillAlice.username, "alice");
});

test("bob NO puede eliminar la cuenta de alice (403) y la cuenta sigue existiendo", async () => {
    const res = await request(app)
        .delete(`/api/users/${alice.id}`)
        .set("Authorization", `Bearer ${bob.token}`);

    assert.equal(res.status, 403);

    const stillExists = await prisma.users.findUnique({ where: { id: alice.id } });
    assert.notEqual(stillExists, null);
});

test("alice SÍ puede actualizar su propia cuenta", async () => {
    const res = await request(app)
        .put(`/api/users/${alice.id}`)
        .set("Authorization", `Bearer ${alice.token}`)
        .send({ full_name: "Alice Actualizada" });

    assert.equal(res.status, 200);
    assert.equal(res.body.full_name, "Alice Actualizada");
    assert.equal(res.body.password, undefined);
});
