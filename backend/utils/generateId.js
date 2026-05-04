const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nano = customAlphabet(alphabet, 10);

function generateId(prefix = '') {
  return `${prefix}${nano()}`;
}

module.exports = { generateId };
