'use strict';

import React from 'react';
import FluidCommentWrapper from './FluidCommentWrapper';
import { getDeepProp, getResponseDocument, getUrl } from "./functions";

const loginUrl = getUrl('/user/login?_format=json');
const entryPointUrl = getUrl('/jsonapi');

class FluidCommentWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = { commentsUrl: null, loggedIn: null, currentNode: null };
    }

    componentDidMount() {
        getResponseDocument(entryPointUrl).then(responseDoc => {
            const nodeUrl = getDeepProp(responseDoc, `links.${this.props.hostType}.href`) + `/${this.props.hostId}`;
            const commentsUrl = getDeepProp(responseDoc, `links.${this.props.commentType}.href`);
            const loggedIn = getDeepProp(responseDoc, 'meta.links.me.href') !== false;
            this.setState({commentsUrl, loggedIn});
            getResponseDocument(nodeUrl).then(currentNode => {
                this.setState({currentNode: getDeepProp(currentNode, 'data')});
            });
        });
    }

    render() {
        return <div>
            {this.state.commentsUrl && <FluidCommentWrapper
                loginUrl={this.state.loggedIn === false ? loginUrl : null}
                commentType={this.props.commentType}
                commentsUrl={this.state.commentsUrl}
                currentNode={this.state.currentNode}
                hostId={this.props.hostId}
            />}
        </div>
    }
}

export default FluidCommentWidget;
