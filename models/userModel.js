// Simples armazenamento em memória
const users = [];
let nextId = 1;

/**
 * @param {{ username: string, email: string, passwordHash: string }} param0
 * @returns {{ id:number, username:string, email:string, passwordHash:string }}
 */
function addUser({ username, email, passwordHash }) {
  const user = {
    id: nextId++,
    username,
    email,
    passwordHash,
  };
  users.push(user);
  return user;
}

/**
 * @param {string} username
 * @returns {object|undefined}
 */
function findByUsername(username) {
  const u = String(username || '').toLowerCase();
  return users.find(user => user.username.toLowerCase() === u);
}

/**
 * @returns {{ id:number, username:string, email:string }[]}
 */
function listUsers() {
  return users.map(({ id, username, email }) => ({ id, username, email }));
}

module.exports = {
  addUser,
  findByUsername,
  listUsers,
};