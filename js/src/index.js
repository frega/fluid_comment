'use strict';

import React from 'react'
import { render } from 'react-dom';
import FluidCommentWrapper from './FluidCommentWrapper';
import { getResponseDocument, getDeepProp } from './functions';

document.addEventListener("DOMContentLoaded", function() {
    const commentRoots = document.querySelectorAll('.fluid-comment-root');
    if (commentRoots) {
      commentRoots.forEach(function(commentRoot) {
        console.log(commentRoot);
        const commentedResourceUrl = commentRoot.getAttribute('data-fluid-comment-commented-resource-url');
        const commentType = commentRoot.getAttribute('data-jsonapi-comment-type');
        const filterDefaultFormat = commentRoot.getAttribute('data-fluid-comment-filter-default-format');
        const commentFieldName = commentRoot.getAttribute('data-jsonapi-comment-field-name');
        getResponseDocument(commentedResourceUrl).then(doc => {
          const commentedResource = getDeepProp(doc, 'data');
          render((commentedResource &&
            <FluidCommentWrapper
              commentType={commentType}
              currentNode={commentedResource}
              commentFieldName={commentFieldName}
              filterDefaultFormat={filterDefaultFormat}
            />
        ), commentRoot);
        });
      });
    }
});
