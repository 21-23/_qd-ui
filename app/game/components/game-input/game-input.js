import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import { SolutionCorrect } from 'common/constants/solution';
import CodeBox from 'common/components/code-box/code-box';
import CodeEditor from '../code-editor/code-editor';

import { verifySolution } from '../../action-creators/round';
import { RoundPhases } from 'common/constants/round';

import './game-input.styl';

class GameInput extends Component {
    render({ result, playerInput, verifySolution, correct, phase }) {
        return (
            <div className="game-input">
                <CodeEditor
                    onChange={verifySolution}
                    playerInput={playerInput}
                    isReadOnly={(correct === SolutionCorrect.CORRECT) || phase !== RoundPhases.IN_PROGRESS}
                />
                <div className="separator"></div>
                <CodeBox value={result} />
            </div>
        );
    }
}

export default connect((state) => {
    return {
        result: state.currentRound.solutionResult,
        playerInput: state.currentRound.playerInput,
        correct: state.currentRound.correct,
        phase: state.currentRound.phase,
    };
}, {
    verifySolution,
})(GameInput);
