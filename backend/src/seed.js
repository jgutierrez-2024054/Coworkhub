// seed.js
// Deja la base de datos en un estado conocido para las pruebas de caja negra:
// 1 admin, 2 miembros con planes distintos, 2 espacios y algunas reservas.
// Se puede correr como script (`npm run seed`) o disparar via POST /test/seed.
require('dotenv').config();
const { sequelize, syncDatabase, Member, Plan, Space, Reservation } = require('./models');
const { hashPassword } = require('./helpers/password');

async function runSeed() {
  await syncDatabase();

  // Limpiar en orden que respeta las llaves foraneas
  await Reservation.destroy({ where: {}, truncate: true, cascade: true });
  await Member.destroy({ where: {}, truncate: true, cascade: true });
  await Space.destroy({ where: {}, truncate: true, cascade: true });
  await Plan.destroy({ where: {}, truncate: true, cascade: true });

  const planBasico = await Plan.create({
    name: 'Basico',
    price: 150,
    includedHours: 10,
    allowedSpaceTypes: ['desk'],
  });
  const planPro = await Plan.create({
    name: 'Pro',
    price: 350,
    includedHours: 30,
    allowedSpaceTypes: ['desk', 'meeting_room'],
  });
  await Plan.create({
    name: 'Premium',
    price: 600,
    includedHours: 60,
    allowedSpaceTypes: ['desk', 'meeting_room', 'event_room'],
  });

  const spaceDesk = await Space.create({
    name: 'Escritorio 1',
    type: 'desk',
    capacity: 1,
    hourlyRate: 15,
    active: true,
  });
  const spaceMeeting = await Space.create({
    name: 'Sala Reuniones A',
    type: 'meeting_room',
    capacity: 6,
    hourlyRate: 40,
    active: true,
  });

  const adminPasswordHash = await hashPassword('Admin1234!');
  const admin = await Member.create({
    name: 'Admin CoWork',
    email: 'admin@coworkhub.test',
    passwordHash: adminPasswordHash,
    role: 'admin',
    planId: null,
  });

  const member1PasswordHash = await hashPassword('Miembro1234!');
  const member1 = await Member.create({
    name: 'Ana Lopez',
    email: 'ana@coworkhub.test',
    passwordHash: member1PasswordHash,
    role: 'member',
    planId: planBasico.id,
  });

  const member2PasswordHash = await hashPassword('Miembro1234!');
  const member2 = await Member.create({
    name: 'Carlos Ruiz',
    email: 'carlos@coworkhub.test',
    passwordHash: member2PasswordHash,
    role: 'member',
    planId: planPro.id,
  });

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 15, 9, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), 15, 11, 0, 0);

  await Reservation.create({
    memberId: member1.id,
    spaceId: spaceDesk.id,
    startsAt: start,
    endsAt: end,
    hourlyRateSnapshot: spaceDesk.hourlyRate,
    status: 'active',
  });

  await Reservation.create({
    memberId: member2.id,
    spaceId: spaceMeeting.id,
    startsAt: new Date(now.getFullYear(), now.getMonth(), 16, 14, 0, 0),
    endsAt: new Date(now.getFullYear(), now.getMonth(), 16, 16, 0, 0),
    hourlyRateSnapshot: spaceMeeting.hourlyRate,
    status: 'active',
  });

  return {
    admin: { email: admin.email, password: 'Admin1234!' },
    members: [
      { email: member1.email, password: 'Miembro1234!', plan: planBasico.name },
      { email: member2.email, password: 'Miembro1234!', plan: planPro.name },
    ],
    spaces: [spaceDesk.name, spaceMeeting.name],
  };
}

if (require.main === module) {
  runSeed()
    .then((summary) => {
      console.log('Seed completado:', summary);
      return sequelize.close();
    })
    .catch((err) => {
      console.error('Error al hacer seed:', err);
      process.exit(1);
    });
}

module.exports = runSeed;
