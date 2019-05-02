import React, {Component} from 'react'
import {render} from 'react-dom'
import {
  FluidCommentWrapper,
  getDeepProp,
  getResponseDocument,
  getUrl
} from '../../src'

const loginUrl = getUrl('/user/login?_format=json');
const entryPointUrl = getUrl('/jsonapi');
const commentType = 'comment--comment';
const hostType = 'node--article';
const hostId = 'c39a72fe-f486-4f6a-980b-73e0a8d467c3';

class Demo extends Component {

  constructor(props) {
    super(props);
    this.state = { commentsUrl: null, loggedIn: null, currentNode: null };
  }

  componentDidMount() {
    getResponseDocument(entryPointUrl).then(responseDoc => {
      const nodeUrl = getDeepProp(responseDoc, `links.${hostType}.href`) + `/${hostId}`;
      const commentsUrl = getDeepProp(responseDoc, `links.${commentType}.href`);
      const loggedIn = getDeepProp(responseDoc, 'meta.links.me.href') !== false;
      this.setState({commentsUrl, loggedIn});
      getResponseDocument(nodeUrl).then(currentNode => {
        this.setState({currentNode: getDeepProp(currentNode, 'data')});
      });
    });
  }

  render() {
    return <div>
      <h1>fluid-comment Demo</h1>
      {this.state.commentsUrl && <FluidCommentWrapper
          loginUrl={this.state.loggedIn === false ? loginUrl : null}
          commentType={commentType}
          commentsUrl={this.state.commentsUrl}
          currentNode={this.state.currentNode}
          hostId={hostId}
      />}
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'));
