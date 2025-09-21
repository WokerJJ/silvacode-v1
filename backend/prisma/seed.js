import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    // Crear usuarios
    const user1 = await prisma.users.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: {
            username: 'alice',
            email: 'alice@example.com',
            full_name: 'Alice Johnson',
            password: 'alice123',
        },
    });

    const user2 = await prisma.users.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: {
            username: 'bob',
            email: 'bob@example.com',
            full_name: 'Bob Smith',
            password: 'bob12334',
        },
    });

    // Crear jardines
    const garden1 = await prisma.gardens.upsert({
        where: { userSlugUnique: { slug: 'my-garden', user_id: user1.id } },
        update: {},
        create: {
            user_id: user1.id,
            name: 'My Garden',
            slug: 'my-garden',
            lat: 40.7128,
            lng: -74.0060,
        },
    });

    const garden2 = await prisma.gardens.upsert({
        where: { userSlugUnique: { slug: 'backyard', user_id: user2.id } },
        update: {},
        create: {
            user_id: user2.id,
            name: 'Backyard Garden',
            slug: 'backyard',
            lat: 34.0522,
            lng: -118.2437,
        },
    });

    // Crear cultivos
    const crops_data = [
        {
            name: 'Tomato',
            description: 'Juicy red tomatoes, perfect for salads.',
            climate: { min_temp: 15, max_temp: 30 },
            cycle_days: 90,
            hacks: ['Stake plants for support', 'Water early morning'],
        },
        {
            name: 'Carrot',
            description: 'Crunchy orange root vegetable.',
            climate: { min_temp: 10, max_temp: 25 },
            cycle_days: 70,
            hacks: ['Thin seedlings', 'Loosen soil regularly'],
        },
        {
            name: 'Lettuce',
            description: 'Leafy green for fresh salads.',
            climate: { min_temp: 10, max_temp: 22 },
            cycle_days: 45,
            hacks: ['Harvest outer leaves', 'Keep soil moist'],
        },
        {
            name: 'Basil',
            description: 'Fragrant herb for cooking.',
            climate: { min_temp: 18, max_temp: 35 },
            cycle_days: 60,
            hacks: ['Pinch leaves regularly', 'Pluck flowers to extend life'],
        },
    ];

    const crops = [];
    for (const crop_data of crops_data) {
        const crop = await prisma.crops.upsert({
            where: { name: crop_data.name },
            update: {},
            create: crop_data,
        });
        crops.push(crop);
    }

    // Asociar cultivos con jardines
    await prisma.garden_crops.createMany({
        data: [
            { garden_id: garden1.id, crop_id: crops[0].id, sow_date: new Date('2025-09-01'), status: 'planted' },
            { garden_id: garden1.id, crop_id: crops[1].id, sow_date: new Date('2025-09-05'), status: 'planted' },
            { garden_id: garden2.id, crop_id: crops[2].id, sow_date: new Date('2025-09-03'), status: 'planted' },
            { garden_id: garden2.id, crop_id: crops[3].id, sow_date: new Date('2025-09-07'), status: 'planted' },
        ],
        skipDuplicates: true,
    });

    console.log('🌱 Seed completado!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
