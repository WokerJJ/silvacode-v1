import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { createAuthLimiter } from "../src/middlewares/rateLimiter.js";

// No usa setup.js/app.js a propósito: prueba el limiter en aislamiento, con
// skipInTest: false, sobre una mini app descartable — así no depende de la
// base de datos ni del skip automático que la app real usa en NODE_ENV=test.
test("el rate limiter bloquea con 429 después de superar el límite", async () => {
    const app = express();
    app.get("/probe", createAuthLimiter({ limit: 3, skipInTest: false }), (req, res) => res.json({ ok: true }));

    for (let i = 0; i < 3; i++) {
        const res = await request(app).get("/probe");
        assert.equal(res.status, 200);
    }

    const blocked = await request(app).get("/probe");
    assert.equal(blocked.status, 429);
});

test("con skipInTest: true (default) el limiter no bloquea en NODE_ENV=test", async () => {
    process.env.NODE_ENV = "test";

    const app = express();
    app.get("/probe", createAuthLimiter({ limit: 1 }), (req, res) => res.json({ ok: true }));

    for (let i = 0; i < 5; i++) {
        const res = await request(app).get("/probe");
        assert.equal(res.status, 200);
    }
});
