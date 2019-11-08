import { getDeepProp } from './functions';

const rels = {
  'add': {
    type: 'add',
    method: 'POST'
  },
  'update': {
    type: 'update',
    method: 'PATCH'
  },
  'remove': {
    type: 'delete',
    method: 'DELETE'
  },
  'https://drupal.org/project/jsonapi_comment/link-relations/#comments': {
    type: 'comments',
    method: 'GET'
  },
  'https://drupal.org/project/jsonapi_comment/link-relations/#comment': {
    type: 'comment',
    method: 'GET'
  }
};

const getRelUriByLinkRelationType = (linkRelationType) => (
  Object.keys(rels).find(uri => rels[uri].type === linkRelationType)
);

export const getMetaFromRel = (rel) => (
  Array.isArray(rel)
    ? rel.filter(rel => rels[rel] !== undefined).map(rel => rels[rel])
    : rels[rel] ? [rels[rel]] : []
);


/**
 *
 * @param obj
 * @param commentFieldName  @todo: filter on commentFieldName name.
 * @param linkRelationType search for this link relation type.
 * @returns {string[]}
 */
function getMatchingLinkKeysByLinkRelationType(obj, commentFieldName, linkRelationType) {
  const relUri = getRelUriByLinkRelationType(linkRelationType);
  return Object.keys(obj['links']).filter(function(key) {
    const rels = getDeepProp(obj['links'][key], `meta.linkParams.rel`);
    return Array.isArray(rels) && rels.includes(relUri);
  });
}

/**
 * Returns true if object has one or more links with given link relation type.
 *
 * @param obj
 * @param commentFieldName  @todo: filter on commentFieldName name.
 * @param linkRelationType search for this link relation type.
 * @returns {boolean}
 */
export function objectHasLinkWithLinkRelationType(obj, commentFieldName, linkRelationType) {
  return getMatchingLinkKeysByLinkRelationType(obj, commentFieldName, linkRelationType).length > 0;
}

/**
 * Returns link objects with a matching relUri.
 *
 * @param obj
 * @param commentFieldName  @todo: filter on commentFieldName name.
 * @param linkRelationType
 * @returns {Array<any>}
 */
export function getLinkObjectsByLinkRelationType(obj, commentFieldName, linkRelationType) {
  return getMatchingLinkKeysByLinkRelationType(obj, commentFieldName, linkRelationType).map(function(key) {
    return obj['links'][key];
  });
}

/**
 * @param obj
 * @param commentFieldName
 * @param linkRelationType
 */
export function getLinkHrefByLinkRelationType(obj, commentFieldName, linkRelationType) {
  const matchingLinkObjects = getLinkObjectsByLinkRelationType(obj, commentFieldName, linkRelationType);
  if (matchingLinkObjects.length > 1) {
    throw new Exception('@todo: this is a temporary exception as we currently do not filter by commentFieldName');
  }
  return matchingLinkObjects[0].href;
}
