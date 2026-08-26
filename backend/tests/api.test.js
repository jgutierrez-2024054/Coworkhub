// tests/api.test.js
// Pruebas de integracion (extra) que cubren los 5 contratos del enunciado.
// Requieren una base MySQL real accesible via las variables de entorno
// (.env) -- por eso corren con "npm test" contra un entorno con Docker o
// MySQL local levantado, no en un sandbox aislado.
require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const runSeed = require('../src/seed');

let adminCookies;
let memberCookies;
let csrfToken;
let memberCsrf;
let member1Id;
let spaceDeskId;

function extractCookie(res, name) {
  const raw = res.headers['set-cookie'] || [];
  const found = raw.find((c) => c.startsWith(name + '='));
  return found ? found.split(';')[0] : null;
}

beforeAll(async () => {
  await runSeed();
});

afterAll(async () => {
  await sequelize.close();
});

describe('1. Autenticacion', () => {
  test('login con credenciales incorrectas -> 401 sin cookie', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'ana@coworkhub.test', password: 'incorrecta' });
    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('login con credenciales correctas -> 200 + cookie de sesion', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@coworkhub.test', password: 'Admin1234!' });
    expect(res.status).toBe(200);
    const sessionCookie = extractCookie(res, process.env.COOKIE_NAME || 'cwh_session');
    expect(sessionCookie).toBeTruthy();
    adminCookies = [sessionCookie, extractCookie(res, 'cwh_csrf')].filter(Boolean);
    csrfToken = extractCookie(res, 'cwh_csrf')?.split('=')[1];
  });
});

describe('2. Proteccion de rutas por rol', () => {
  test('ruta privada sin sesion -> 401', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
  });

  test('miembro pegandole a ruta admin (POST /plans) -> 403', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'ana@coworkhub.test', password: 'Miembro1234!' });
    memberCookies = [
      extractCookie(loginRes, process.env.COOKIE_NAME || 'cwh_session'),
      extractCookie(loginRes, 'cwh_csrf'),
    ].filter(Boolean);
    const memberCsrfLocal = extractCookie(loginRes, 'cwh_csrf')?.split('=')[1];
    memberCsrf = memberCsrfLocal;

    const me = await request(app).get('/me').set('Cookie', memberCookies);
    member1Id = me.body.data.id;

    const res = await request(app)
      .post('/plans')
      .set('Cookie', memberCookies)
      .set('X-CSRF-Token', memberCsrfLocal)
      .send({ name: 'Hack', price: 1, includedHours: 1, allowedSpaceTypes: ['desk'] });
    expect(res.status).toBe(403);
  });
});

describe('3. No doble reserva', () => {
  test('crear reserva valida -> 201, y solapada -> 409', async () => {
    const spaces = await request(app).get('/spaces').set('Cookie', adminCookies);
    spaceDeskId = spaces.body.data.find((s) => s.type === 'desk').id;

    const start = new Date();
    start.setDate(start.getDate() + 5);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);

    const first = await request(app)
      .post('/reservations')
      .set('Cookie', memberCookies)
      .set('X-CSRF-Token', memberCsrf)
      .send({ spaceId: spaceDeskId, startsAt: start.toISOString(), endsAt: end.toISOString() });
    expect(first.status).toBe(201);

    const overlapStart = new Date(start);
    overlapStart.setMinutes(30);
    const overlapEnd = new Date(end);
    overlapEnd.setMinutes(30);

    const second = await request(app)
      .post('/reservations')
      .set('Cookie', memberCookies)
      .set('X-CSRF-Token', memberCsrf)
      .send({ spaceId: spaceDeskId, startsAt: overlapStart.toISOString(), endsAt: overlapEnd.toISOString() });
    expect(second.status).toBe(409);
  });
});

describe('4. Limite del plan', () => {
  test('reserva que excede las horas del plan -> 422', async () => {
    const start = new Date();
    start.setDate(start.getDate() + 6);
    start.setHours(8, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 0, 0, 0); // 15 horas, mayor al plan Basico (10h)

    const res = await request(app)
      .post('/reservations')
      .set('Cookie', memberCookies)
      .set('X-CSRF-Token', memberCsrf)
      .send({ spaceId: spaceDeskId, startsAt: start.toISOString(), endsAt: end.toISOString() });
    expect(res.status).toBe(422);
  });
});

describe('5. Facturacion que cuadra', () => {
  test('GET /reports/consumo coincide con las reservas reales', async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const res = await request(app)
      .get('/reports/consumo')
      .query({ memberId: member1Id, month })
      .set('Cookie', memberCookies);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('horas');
    expect(res.body.data).toHaveProperty('monto');
  });
});
