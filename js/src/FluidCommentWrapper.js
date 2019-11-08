'use strict';
import React from 'react';
import { getDeepProp, getResponseDocument, formatBodyAdd, getFormKey } from './functions';
import { objectHasLinkWithLinkRelationType, getLinkObjectsByLinkRelationType, getLinkHrefByLinkRelationType } from './routes';

import FluidCommentList from './FluidCommentList';
import FluidCommentForm from './FluidCommentForm';
import FluidCommentContext from './FluidCommentContext';

class FluidCommentWrapper extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      isRefreshing: false,
      threaded: false,
      formKey: getFormKey()
    };
  }

  componentDidMount() {
    this.refreshComments();
  }


  render() {
    const { currentNode, filterDefaultFormat, commentFieldName } = this.props;
    const { comments, isRefreshing, threaded, formKey } = this.state;
    const hasLink = objectHasLinkWithLinkRelationType(currentNode, commentFieldName, 'comment');

    const show = currentNode && objectHasLinkWithLinkRelationType(currentNode, commentFieldName, 'comments');

    return (
      <FluidCommentContext.Provider value={{ isRefreshing, filterDefaultFormat }}>
      {show &&
        <FluidCommentList
          threaded={threaded}
          comments={comments}
          refresh={this.refreshComments}
        />
      }

      {hasLink &&
        <div>
          <h2 className="title comment-form__title">Add new comment</h2>
          <FluidCommentForm
            key={formKey}
            handleSubmit={this.addComment}
          />
        </div>
      }
      </FluidCommentContext.Provider>
    );
  }

  addComment = (values) => {
    const { currentNode: node, commentType: type, commentFieldName } = this.props;

    if (objectHasLinkWithLinkRelationType(node, commentFieldName, 'comment')) {
      // @todo: catch potential multiple matches.
      const linkObject = getLinkObjectsByLinkRelationType(node, commentFieldName, 'comment')[0];

      const commentsUrl = linkObject.href;
      const field = linkObject.meta.commentFieldName;
      const body = formatBodyAdd(values, node, field, type);
      const method = 'POST';

      getResponseDocument(commentsUrl, { method, body }).then(doc => {
        if (!doc.errors) {
          this.refreshComments();
          this.resetForm();
        }
      });
    }
  };

  refreshComments = () => {
    const { currentNode: node, commentFieldName } = this.props;

    if (objectHasLinkWithLinkRelationType(node, commentFieldName, 'comments')) {
      const commentsUrl = getLinkHrefByLinkRelationType(node, commentFieldName, 'comments');
      this.getAndAddComments(`${commentsUrl}/?include=uid.user_picture`);
    }
  };

  resetForm = () => {
    this.setState({ formKey: getFormKey() });
  };

  /**
   * @todo Replace with serializing
   */
  mergeIncluded(comments, included) {
    return comments.map(comment => {

      const { uid } = comment.relationships;
      const users = included.filter(item => item.id === uid.data.id);

      if (users.length > 0) {
        let user = users[0];
        const pic = getDeepProp(user, 'relationships.user_picture.data');
        const uid = getDeepProp(user, 'attributes.drupal_internal__uid');

        if (pic) {
          const pictures = included.filter(item => item.id === pic.id);
          if (pictures.length > 0) {
            user = Object.assign(user, { picture: pictures[0] });
          }
        }

        if (uid) {
          user = Object.assign(user, { url: `/user/${uid}`});
        }

        return Object.assign(comment, { user });
      }

      return comment;
    })
  }

  getAndAddComments(commentsUrl, previous = []) {
    this.setState({ isRefreshing: true });

    getResponseDocument(commentsUrl).then(doc => {
      this.setState({threaded: getDeepProp(doc, 'meta.displayOptions.threaded')});
      const data = getDeepProp(doc, 'data');
      const included = getDeepProp(doc, 'included');
      const nextUrl = getDeepProp(doc, 'links.next.href');

      const comments = [...previous, ...this.mergeIncluded(data, included)];

      if (nextUrl) {
        this.getAndAddComments(nextUrl, comments);
      }

      this.setState({ comments, isRefreshing: false });
    });
  }

}

export default FluidCommentWrapper;
