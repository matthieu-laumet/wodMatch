require('dotenv').config();
const Pool = require("pg").Pool;

const peakConfig = {
  max: 25,
  min: 5,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 2000,
  acquireTimeoutMillis: 5000,
  allowExitOnIdle: false,
  maxUses: 7500,
};

const instances = {};

const pool = ({ bdd = 'WODMATCH' } = {}) => {
  if (instances[bdd]) return instances[bdd]; // réutilise si déjà créé

  const DB_PORT       = process.env[`${bdd}_DB_PORT`];
  const DB_USER       = process.env[`${bdd}_DB_USER`];
  const DB_PASSWORD   = process.env[`${bdd}_DB_PASSWORD`];
  const DB_HOST       = process.env[`${bdd}_DB_HOST`];
  const DB_DATABASE   = process.env[`${bdd}_DB_DATABASE`];
  const SSL           = process.env[`${bdd}_SSL`];
  const PIC_AFFLUENCE = process.env[`${bdd}_PIC_AFFLUENCE`];

  const isPeakMode = PIC_AFFLUENCE === 'peak';

  instances[bdd] = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
    ssl: SSL === 'true',
    ...(isPeakMode ? peakConfig : {})
  });

  return instances[bdd];
};

// Fermeture propre de toutes les instances
const shutdown = async () => {
  await Promise.all(Object.values(instances).map(p => p.end()));
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = pool;