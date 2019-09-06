import { getDeepProp } from './functions';

const rels = {
  'add': {
    alias: 'add',
    method: 'POST'
  },
  'update': {
    alias: 'update',
    method: 'PATCH'
  },
  'remove': {
    alias: 'delete',
    method: 'DELETE'
  },
  'collection': {
    alias: 'collection',
    method: 'GET'
  }
};

export const getRelUri = (alias) => (
  Object.keys(rels).find(uri => rels[uri].alias === alias)
);

export const getMetaFromRel = (rel) => (
  Array.isArray(rel)
    ? rel.filter(rel => rels[rel] !== undefined).map(rel => rels[rel])
    : rels[rel] ? [rels[rel]] : []
);


export function objectHasLinkWithRel(obj, key, rel) {
  const rels = getDeepProp(obj, `links.${key}.meta.linkParams.rel`);
  return Array.isArray(rels) && rels.includes(rel);
}
