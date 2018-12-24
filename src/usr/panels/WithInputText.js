import React from 'react';
import PropTypes from 'prop-types';

class WithInputText extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    onSubmit: () => {},
    onCancel: () => {},
  };

  constructor (props) {
    super(props);
  }

  handleClickOk = () => {
    this.props.onSubmit(this.inputElement.value);
  };

  handleClickCancel = () => {
    this.props.onCancel();
  };

  render () {
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{paddingBottom: '1em'}}>
          <input style={{width: '100%'}} ref={me => this.inputElement = me} type="text" />
        </div>
        <div style={{display: "flex", alignItems: 'center', justifyContent: 'flex-end'}}>
          <div>
            <button style={{padding: '0.5em'}} onClick={this.handleClickCancel}>Cancel</button>
          </div>
          <div>
            <button style={{padding: '0.5em'}} onClick={this.handleClickOk}>OK</button>
          </div>
        </div>
      </div>
    );
  }
}

export default WithInputText;
