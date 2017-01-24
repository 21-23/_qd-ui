import { combineReducers } from 'redux';

import game from './game';
import userPanel from './user-panel';

export default combineReducers({
    game,
    userPanel,
});
