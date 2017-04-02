import { CONNECTION_STATUS } from '../actions/connection';
import { SELECTED_ROUND, CURRENT_ROUND } from '../actions/round';
import { SESSION_STATE } from '../actions/session';

const defaultState = {
    connected: false,
    currentRoundIndex: 3,
    selectedRoundIndex: 0,
    puzzles: [
        { name: 'Puzzle 0' },
        { name: 'Puzzle 1' },
        { name: 'Puzzle 2' },
        { name: 'Puzzle 3' },
        { name: 'Puzzle 4' },
    ]
};

function updatePuzzlesList(state, session) {
    return Object.assign({}, state, {
        currentRoundIndex: session.currentRoundIndex,
        selectedRoundIndex: session.currentRoundIndex,
        puzzles: Array(session.puzzleCount).fill('Puzzle'), // TODO: do we need an array? are we going to show all puzzles' names? is count only enough?
    });
}

function updateConnectionStatus(state, connected) {
    return Object.assign({}, state, { connected });
}

function updateSelectedRound(state, selectedRoundIndex) {
    return Object.assign({}, state, { selectedRoundIndex });
}

function updateCurrentRound(state, round) {
    return Object.assign({}, state, { currentRoundIndex: round.index });
}

export default function session(state = defaultState, action) {
    switch(action.type) {
        case SESSION_STATE:
            return updatePuzzlesList(state, action.payload.session);
        case CONNECTION_STATUS:
            return updateConnectionStatus(state, action.payload);
        case SELECTED_ROUND:
            return updateSelectedRound(state, action.payload);
        case CURRENT_ROUND:
            return updateCurrentRound(state, action.payload);
        default:
            return state;
    }
}
