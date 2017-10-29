import createPhoenix from 'phoenix';
import messageFactory from 'message-factory'; // TODO: no need in the whole module
import { error, warn, log } from 'steno';

import config from '../config.json';
import { buildEndpointUri } from 'common/utils/connection';
import { SolutionCorrect } from 'common/constants/solution';

import * as RoundActions from '../actions/round';

import { updateConnectionStatus } from '../action-creators/connection';
import * as RoundActionsCreator from '../action-creators/round';
import { setSessionState } from '../action-creators/session';

const { parseMessage, protocol: { frontService, ui } } = messageFactory;
const MESSAGE_NAME = ui.MESSAGE_NAME;

function formatStateMessage(message) {
    const { roundCountdown, startCountdown, roundPhase, puzzle } = message;
    const { puzzleIndex, puzzleCount, displayName } = message;

    return {
        round: {
            puzzle,
            countdownRemaining: startCountdown,
            remaining: roundCountdown,
            phase: roundPhase,
            playerInput: message.solution && message.solution.code,
        },
        participant: {
            displayName,
        },
        session: {
            currentRoundIndex: typeof puzzleIndex === 'number' ? puzzleIndex : -1,
            puzzleCount,
        },
    };
}

function getAction(message) {
    switch (message.name) {
        case MESSAGE_NAME.solutionEvaluated:
            return RoundActionsCreator.updateSolutionResult({
                error: message.error,
                result: message.result,
                correct: message.correct,
                time: message.time,
            });
        case MESSAGE_NAME.puzzleChanged:
            return RoundActionsCreator.updateCurrentRound({
                index: message.puzzleIndex,
                duration: message.puzzleOptions.timeLimit,
                name: message.puzzleName,
            });
        case MESSAGE_NAME.roundPhaseChanged:
            return RoundActionsCreator.updateRoundPhase(message.roundPhase);
        case MESSAGE_NAME.startCountdownChanged:
            return RoundActionsCreator.updateCountdown(message.startCountdown);
        case MESSAGE_NAME.puzzle:
            return RoundActionsCreator.updatePuzzle({
                input: message.input,
                expected: message.expected,
            });
        case MESSAGE_NAME.roundCountdownChanged:
            return RoundActionsCreator.updateRemaining(message.roundCountdown);
        case MESSAGE_NAME.playerSessionState:
            return setSessionState(formatStateMessage(message));
        default:
            return null;
    }
}

function handleServerMessage(message, dispatch) {
    const action = getAction(message);

    if (action) {
        dispatch(action);
    } else {
        warn('Unknown message from server');
    }
}

function handleClientSolution(phoenix, userInput, dispatch) {
    if (!userInput) {
        // if user input is empty - emulate empty solution
        return dispatch(RoundActionsCreator.updateSolutionResult({
            error: null,
            result: '',
            correct: SolutionCorrect.INCORRECT,
            time: 0,
        }));
    }

    return phoenix.send(frontService.solution(userInput));
}

function handleClientAction(action, phoenix, dispatch, getState) {
    switch (action.type) {
        case RoundActions.SOLUTION:
            return handleClientSolution(phoenix, action.payload, dispatch);
        default:
            return log('Skip action reaction:', action.type);
    }
}

export default function serverPipeMiddleware({ getState, dispatch }) {
    // we can create a pipe immediately
    // phoenix will connect it ASAP
    const phoenix = createPhoenix(WebSocket, {
        uri: buildEndpointUri(config['server-endpoint']['uri']),
        timeout: config['server-endpoint']['timeout'],
    });

    //just for messages emulation
    if (process.env.NODE_ENV !== 'production') {
        window.dispatch = dispatch;
        window.handleServerMessage = handleServerMessage;
        window.MESSAGE_NAME = MESSAGE_NAME;
    }

    phoenix
        .on('connected', () => {
            log('server connected');
            dispatch(updateConnectionStatus(true));
        })
        .on('disconnected', () => {
            error('server disconnected');
            dispatch(updateConnectionStatus(false));
        })
        .on('message', (incomingMessage) => {
            log('server message', incomingMessage);
            const { message } = parseMessage(incomingMessage.data);

            handleServerMessage(message, dispatch);
        });

    return (next) => {
        return (action) => {
            handleClientAction(action, phoenix, dispatch, getState);

            return  next(action);
        };
    };
};
