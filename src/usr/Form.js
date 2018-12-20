import React from 'react';
import PropTypes from 'prop-types';

class Form extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    onAnotherSubmit: PropTypes.func,
  };

  static defaultProps = {
    onSubmit: () => {
      console.info('Nothing...');
    },
    onAnotherSubmit: () => {
      console.info('Nothing...');
    },
  };

  constructor (props) {
    super(props);
  }

  handleClick = () => {
    this.props.onSubmit(this.input.value);
  };

  handleAnotherClick = () => {
    this.props.onAnotherSubmit('Hey,... I am another');
  };

  render () {
    return (
      <div>
        <h3>Title</h3>
        <input ref={me => this.input = me} type="text"/>
        <button onClick={this.handleClick} >Click on me</button>
        <button onClick={this.handleAnotherClick} >Another</button>
      </div>
    );
  }
}

export default Form;
