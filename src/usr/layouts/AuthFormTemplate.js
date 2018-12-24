import React from 'react';
import PropTypes from 'prop-types';
import Placeholder from './Placeholder';

class AuthFormTemplate extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    mainFormPane: PropTypes.element,
    bottomFormPane: PropTypes.element,
  };

  static defaultProps = {
    title: `<Title Template>`,
    mainFormPane: <Placeholder/>,
    bottomFormPane: <Placeholder/>,
  };

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div style={{display: 'flex', flexDirection: 'column', padding: '1em'}}>
        <div style={{paddingBottom: '1em'}}>
          <h3>Title</h3>
        </div>
        <div style={{paddingBottom: '1em'}}>
          {this.props.mainFormPane}
        </div>
        <div style={{paddingBottom: '2em'}}>
          {this.props.bottomFormPane}
        </div>
      </div>
    );
  }
}

export default AuthFormTemplate;
