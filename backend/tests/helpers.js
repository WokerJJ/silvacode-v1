import "./setup.js";
import prisma from "../src/prisma.js";

// Limpia las tablas entre tests para que uno no dependa de datos que dejó
// otro. Orden importa por las foreign keys: garden_crops depende de gardens
// y crops, gardens depende de users.
export async function resetDb() {
    await prisma.garden_crops.deleteMany();
    await prisma.gardens.deleteMany();
    await prisma.crops.deleteMany();
    await prisma.users.deleteMany();
}

// Registra y loguea un usuario de prueba, devuelve su token y su id — para
// no repetir el mismo register+login en cada test que necesita un usuario
// autenticado.
export async function createTestUser(request, app, { username, email, password = "password123" }) {
    const registerRes = await request(app)
        .post("/auth/register")
        .send({ username, email, password });

    const loginRes = await request(app)
        .post("/auth/login")
        .send({ email, password });

    return { id: registerRes.body.user.id, token: loginRes.body.token };
}
