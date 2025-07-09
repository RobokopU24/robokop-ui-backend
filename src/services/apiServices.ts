import dotenv from 'dotenv';
dotenv.config();
/**
 * @file Central location of all API service URLs.
 */

// External ARAs
const strider = `${process.env.STRIDER}/query`;
const aragorn = `${process.env.ARAGORN}/query`;
const robokop = `${process.env.ROBOKOP}/query`;

// Internal services
const robokache = process.env.ROBOKACHE;

// External APIs
const node_norm = process.env.NODE_NORMALIZER;
const name_resolver = process.env.NAME_RESOLVER;
const biolink = process.env.BIOLINK;

export default {
  strider,
  aragorn,
  robokop,

  robokache,

  node_norm,
  name_resolver,
  biolink,
};
