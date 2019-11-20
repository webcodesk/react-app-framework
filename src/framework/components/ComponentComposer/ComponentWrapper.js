import React, {Component} from 'react';

class ComponentWrapper extends Component {
  render() {
    const {wrappedComponent, propsComponent, cloneProps, children} = this.props;
    return React.createElement(wrappedComponent, {...propsComponent, ...cloneProps}, children);
  }
}

export default ComponentWrapper;
