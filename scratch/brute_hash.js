const crypto = require('crypto');

const targetHash = '3f50d9fe754f7544181375e31d1c434c2db16b1442da554c814153728f6afe73';

const candidates = [
  '',
  '123456',
  '12345678',
  '1234',
  '123',
  'password',
  'admin',
  'study',
  'noteal',
  'root',
  'contraseña',
  'clave',
  '12345',
  'studyacademy',
  'academy',
  'test',
  'demo',
  'user',
  '1111',
  '0000',
  '123456789',
  '1234567890',
  '1234567'
];

console.log('Buscando coincidencia de hash...');
let found = false;
for (const cand of candidates) {
  const hash = crypto.createHash('sha256').update(cand).digest('hex');
  if (hash === targetHash) {
    console.log(`[!] COINCIDENCIA ENCONTRADA: La contraseña es "${cand}"`);
    found = true;
    break;
  }
}

if (!found) {
  console.log('No se encontró coincidencia en la lista básica.');
}
