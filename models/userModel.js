// Simples armazenamento em memória
const users = [];
let nextId = 1;

/**
 * Adiciona um novo usuário com senha hasheada
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
 * Busca usuário pelo username (case-insensitive)
 * @param {string} username
 * @returns {object|undefined}
 */
function findByUsername(username) {
  const u = String(username || '').toLowerCase();
  return users.find(user => user.username.toLowerCase() === u);
}

module.exports = {
  addUser,
  findByUsername,
};