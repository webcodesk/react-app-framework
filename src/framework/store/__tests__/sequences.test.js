import schema_empty from '../../../test/empty/app/schema';
import userFunctions_empty from '../../../test/empty/app/indices/userFunctions';
import schema_sequences from '../../../test/sequences/app/schema';
import userFunctions_sequences from '../../../test/sequences/app/indices/userFunctions';
import schema_merge from '../../../test/merge/app/schema';
import userFunctions_merge from '../../../test/merge/app/indices/userFunctions';

import { createActionSequences } from '../sequences';

describe('Sequences', () => {

  it('create action sequences with empty app files', () => {
    const { actionSequences, targetProperties } =
      createActionSequences(schema_empty.flows, userFunctions_empty);
    expect(actionSequences).toEqual({});
    expect(targetProperties).toEqual({});
  });

  it('create action sequences', () => {
    const { actionSequences, targetProperties } =
      createActionSequences(schema_sequences.flows, userFunctions_sequences);
    expect(actionSequences).toMatchSnapshot();
    expect(targetProperties).toMatchSnapshot();
  });

  it('merge sequences', () => {
      const { actionSequences, targetProperties } =
        createActionSequences(schema_merge.flows, userFunctions_merge);
    expect(actionSequences).toMatchSnapshot();
    expect(targetProperties).toMatchSnapshot();
  });

});