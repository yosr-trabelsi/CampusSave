// Faux Firebase en mémoire : permet de tester l'API sans clé ni connexion.
// Usage : installFakeFirebase() AVANT de require('../src/app').
const path = require('node:path');

function createFake() {
  const store = new Map(); // "users/abc" -> données
  let counter = 0;
  const authUsers = new Map();
  const authCalls = { updateUser: [], deleteUser: [] };

  const clone = (v) => JSON.parse(JSON.stringify(v));

  const docRef = (col, id) => {
    const key = `${col}/${id}`;
    return {
      id, key,
      async get() {
        const exists = store.has(key);
        return { id, exists, data: () => (exists ? clone(store.get(key)) : undefined) };
      },
      async set(data, opts) {
        store.set(key, opts?.merge && store.has(key) ? { ...store.get(key), ...clone(data) } : clone(data));
      },
      async update(data) {
        if (!store.has(key)) throw new Error(`NOT_FOUND ${key}`);
        store.set(key, { ...store.get(key), ...clone(data) });
      },
      async delete() { store.delete(key); },
    };
  };

  const makeQuery = (col, filters = [], max = Infinity) => ({
    where: (f, op, v) => makeQuery(col, [...filters, [f, op, v]], max),
    limit: (n) => makeQuery(col, filters, n),
    async get() {
      const docs = [...store.entries()]
        .filter(([k]) => k.startsWith(`${col}/`))
        .map(([k, v]) => ({ id: k.split('/')[1], data: () => clone(v), v }))
        .filter(({ v }) => filters.every(([f, , val]) => v[f] === val))
        .slice(0, max)
        .map(({ id, data }) => ({ id, data }));
      return { docs, empty: docs.length === 0, size: docs.length };
    },
  });

  const db = {
    collection: (col) => ({
      doc: (id) => docRef(col, id || `auto${++counter}`),
      ...makeQuery(col),
    }),
    batch() {
      const ops = [];
      return {
        set: (ref, data) => ops.push(() => ref.set(data)),
        update: (ref, data) => ops.push(() => ref.update(data)),
        delete: (ref) => ops.push(() => ref.delete()),
        async commit() { for (const op of ops) await op(); },
      };
    },
    async runTransaction(fn) {
      const writes = [];
      const t = {
        get: (ref) => ref.get(),
        set: (ref, d) => writes.push(() => ref.set(d)),
        update: (ref, d) => writes.push(() => ref.update(d)),
      };
      const result = await fn(t);
      for (const w of writes) await w();
      return result;
    },
  };

  const auth = {
    async createUser({ email, password, displayName }) {
      if ([...authUsers.values()].some((u) => u.email === email)) {
        throw Object.assign(new Error('exists'), { code: 'auth/email-already-exists' });
      }
      const uid = `uid${++counter}`;
      authUsers.set(uid, { uid, email, displayName, disabled: false });
      return { uid };
    },
    async deleteUser(uid) { authCalls.deleteUser.push(uid); authUsers.delete(uid); },
    async updateUser(uid, props) { authCalls.updateUser.push([uid, props]); },
    async verifyIdToken(token) {
      if (!token.startsWith('tok:')) throw Object.assign(new Error('bad'), { code: 'auth/argument-error' });
      const uid = token.slice(4);
      return { uid, email: `${uid}@test.tn` };
    },
  };

  return { db, auth, store, authUsers, authCalls };
}

function installFakeFirebase() {
  const fake = createFake();
  const file = require.resolve(path.join(__dirname, '../../src/config/firebase.js'));
  require.cache[file] = {
    id: file, filename: file, loaded: true,
    exports: { db: fake.db, auth: fake.auth, firebaseConfigured: true },
  };
  return fake;
}

module.exports = { installFakeFirebase };
