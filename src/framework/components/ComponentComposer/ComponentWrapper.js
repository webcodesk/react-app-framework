import { pickInObject, omitInObject } from '../../commons/utilities';
import React, {Component} from 'react';

class ComponentWrapper extends Component {
  render() {
    const wrapperPicked = pickInObject(this.props, ['wrappedComponent', 'propsComponent', 'children']);
    const restPicked = omitInObject(
      this.props,
      [
        'wrappedComponent', 'propsComponent', 'children'
      ]
    );
    const {wrappedComponent, propsComponent, children} = wrapperPicked;
    return React.createElement(wrappedComponent, {...restPicked, ...propsComponent}, children);
  }
}

export default ComponentWrapper;
