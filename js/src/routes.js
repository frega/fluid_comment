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
 * Returns link keys with matching comment field name and link relation type.
 *
 * @param {object} JSON:API object
 * @param {string} commentFieldName  filter on commentFieldName name.
 * @param {string} linkRelationType  search for this link relation type.
 * @returns {string[]}
 */
function getMatchingLinkKeysByLinkRelationType(obj, commentFieldName, linkRelationType) {
  const relUri = getRelUriByLinkRelationType(linkRelationType);
  return Object.keys(obj.links).filter(function(key) {
    const linkParams = getDeepProp(obj.links[key], 'meta.linkParams');
    // Exclude if no linkParams or not an object or not matching field name.
    if (!linkParams || typeof linkParams !== 'object' || linkParams['commentFieldName'] != commentFieldName) {
      return false;
    }
    return Array.isArray(linkParams['rel']) && linkParams['rel'].includes(relUri);
  });
}

/**
 * Returns true if object has one or more links with given link relation type.
 *
 * @param {object} JSON:API object
 * @param {string} commentFieldName  filter on commentFieldName name.
 * @param {string} linkRelationType  search for this link relation type.
 * @returns {boolean}
 */
export function objectHasLinkWithLinkRelationType(obj, commentFieldName, linkRelationType) {
  return getMatchingLinkKeysByLinkRelationType(obj, commentFieldName, linkRelationType).length > 0;
}

/**
 * Get link objects by comment field name and link relation type.
 *
 * @param {object} JSON:API object
 * @param {string} commentFieldName  filter on commentFieldName name.
 * @param {string} linkRelationType  search for this link relation type.
 * @returns {Array<any>}
 */
export function getLinkObjectsByLinkRelationType(obj, commentFieldName, linkRelationType) {
  return getMatchingLinkKeysByLinkRelationType(obj, commentFieldName, linkRelationType).map(function(key) {
    return obj['links'][key];
  });
}

/**
 * Get link href by comment field name and link relation type.
 *
 * @param {object} JSON:API object
 * @param {string} commentFieldName  filter on commentFieldName name.
 * @param {string} linkRelationType  search for this link relation type.
 * @returns {string|null} Null if no matching link or href of matched link.
 */
export function getLinkHrefByLinkRelationType(obj, commentFieldName, linkRelationType) {
  const matchingLinkObjects = getLinkObjectsByLinkRelationType(obj, commentFieldName, linkRelationType);
  if (!matchingLinkObjects.length) {
    return null;
  }
  if (matchingLinkObjects.length > 1) {
    throw new Error('@todo: this is a temporary exception as we currently do not filter by commentFieldName');
  }
  return matchingLinkObjects[0].href;
}
