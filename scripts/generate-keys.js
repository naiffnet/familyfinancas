const crypto = require('crypto');

console.log('\n======================================================');
console.log('🔑 GERADOR DE CHAVES CRIPTOGRÁFICAS SEGURAS (LGPD)');
console.log('======================================================\n');

const dataEncryptionKey = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');
const adminOperationKey = crypto.randomBytes(24).toString('hex');

console.log('Copie e cole estas variáveis no seu arquivo .env:\n');
console.log(`DATA_ENCRYPTION_KEY=${dataEncryptionKey}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log(`ADMIN_OPERATION_KEY=${adminOperationKey}`);
console.log('\n======================================================\n');
