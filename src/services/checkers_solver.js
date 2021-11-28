/*
- Turn States
    * Piece selection
        - The player has to select a piece before we move to the next state.
        - If a jump can be made, it must be made.
        - Highlight the pieces that can be moved this turn.
    * Piece Selected
        - Show the places this piece can go
        - User selects the place they want it to go
    * Piece Extra Movement
        - If a jump is again available at the place they moved it, they have to jump again
        - Can only jump with that piece they just moved
        - Repeat until the piece has no movements left
    * End Turn
        - Turn is ended.
        - Check if the game is finished.
        - If the game can still continue, switch sides and go to Piece Selection.
- Board Cell
    * boardSquareOccupantType
    * playerType (if boardSquareOccupantType != NONE)
- Move
    * piecePosition : array, 
    * movePosition : array, 
    * isJump : boolean
*/

import _ from 'lodash';

export const turnStateType = {
    PIECE_SELECTION: 'PIECE_SELECTION',
    PIECE_SELECTED: 'PIECE_SELECTED',
    PIECE_EXTRA_MOVEMENT: 'PIECE_EXTRA_MOVEMENT',
    END_TURN: 'END_TURN'
}

let boardSquareOccupantType = {
    NONE: 'NONE',
    STANDARD: 'STANDARD',
    KING: 'KING'
};

// Assuming we are the bottom player of the board going up.
let pieceMovement = {
    "STANDARD": [[1, -1], [1, 1]],
    "KING": [[1, 1], [-1, 1], [1, -1], [-1, -1]]
}

export const playerType = {
    RED: 'RED', // Bottom player.
    BLACK: 'BLACK' // Top player.
}

let GetDirection = function (playerType) {
    return (playerType === playerType.RED ? 1 : -1); // Top player is going downwards, so we need to flip their movement.
}


let IsPositionWithinBounds = function (size, x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return false;
    return true;
}

export const removeHighlights = (board) => {
    const newBoard = board.map((row) => {
        return row.map((cell) => {
            return { ...cell, isHighlighted: false }
        });
    });
    return newBoard;
}

let FindPossibleMove = function (board, playerType, direction, x, y) {
    var possibleMoves = [];

    if (board[x][y].occupantType === boardSquareOccupantType.NONE) return possibleMoves;
    if (board[x][y].playerType !== playerType) return possibleMoves;
    // Try all the movements this piece has available.
    var currentPieceMovement = pieceMovement[board[x][y].occupantType];
    for (var i = 0; i < currentPieceMovement.length; i++) {
        // Apply the player's direction.
        var wantedPosition = [x + (currentPieceMovement[i][0] * direction), y + (currentPieceMovement[i][1] * direction)];
        if (IsPositionWithinBounds(board.length, wantedPosition[0], wantedPosition[1]) === false) continue;
        if (board[wantedPosition[0]][wantedPosition[1]].occupantType === boardSquareOccupantType.NONE) {
            possibleMoves.push({ piecePosition: [x, y], possiblePosition: [wantedPosition[0], wantedPosition[1]], isJump: false, jumpPos: null });
            continue;
        }

        if (board[wantedPosition[0]][wantedPosition[1]].playerType === playerType) continue;
        // Another player's checker is at this position, check if we can jump it.
        // keep  this wanted position so we can remove the piece when we jump it
        const tempWantedPosition = wantedPosition;
        wantedPosition = [wantedPosition[0] + currentPieceMovement[i][0], wantedPosition[1] + currentPieceMovement[i][1]];
        if (IsPositionWithinBounds(board.length, wantedPosition[0], wantedPosition[1]) === false) continue;
        if (board[wantedPosition[0]][wantedPosition[1]].occupantType !== boardSquareOccupantType.NONE) continue;
        // Jump available.
        possibleMoves.push({ piecePosition: [x, y], possiblePosition: [wantedPosition[0], wantedPosition[1]], isJump: true, jumpPos: tempWantedPosition });
    }
    return possibleMoves;
}

// Find all possible moves for a player on the board currently.
let FindPossibleMoves = function (board, playerType, filterJumps = true) {
    var possibleMoves = []; // Move : [piecePosition : array, possiblePosition : array, isJump : boolean]
    var direction = GetDirection(playerType);
    var jumpExist = false;

    for (var x = 0; x < board.length; x++) {
        for (var y = 0; y < board[0].length; y++) {
            possibleMoves = possibleMoves.concat(FindPossibleMove(board, playerType, direction, x, y));
        }
    }

    for (var i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i].isJump === true) jumpExist = true;
    }

    if (filterJumps && jumpExist) {
        for (var c = possibleMoves.length - 1; c >= 0; c--) {
            if (possibleMoves[c].isJump === false) possibleMoves.splice(c, 1);
        }
    }

    return possibleMoves;
}

// Sees if the user selected a piece. If the piece is a valid pick, we'll go to the move state.
let TrySelectPiece = function (board, playerType, setSelectedPiece, selectedSquare, setTurnState) {
    let possibleMoves = FindPossibleMoves(board, playerType, true);

    let foundPiece = false;
    for (var i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i].piecePosition[0] === selectedSquare[0] && possibleMoves[i].piecePosition[1] === selectedSquare[1]) {
            foundPiece = true;
            break;
        }
    }

    if (foundPiece === false) {
        console.log(selectedSquare + " can not move this turn.");
        return;
    }

    console.log(selectedSquare + " can move.");
    setSelectedPiece(selectedSquare);
    setTurnState(turnStateType.PIECE_SELECTED);
}

let TryMovePiece = function (board, setBoard, playerType, selectedPiece, setSelectedPiece, selectedSquare, setTurnState, turn, setTurn, setWinner) {
    let possibleMoves = FindPossibleMoves(board, playerType, true);

    let piece = board[selectedPiece[0]][selectedPiece[1]];

    if (piece.occupantType === boardSquareOccupantType.NONE) return;
    if (piece.playerType !== playerType) return;
    let moveIndex = -1;
    for (var i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i].piecePosition[0] === selectedPiece[0] && possibleMoves[i].piecePosition[1] === selectedPiece[1]
            && possibleMoves[i].possiblePosition[0] === selectedSquare[0] && possibleMoves[i].possiblePosition[1] === selectedSquare[1]) {
            moveIndex = i;
            break;
        }
    }

    if (moveIndex === -1) return;
    let newBoard = _.cloneDeep(board);

    newBoard[selectedSquare[0]][selectedSquare[1]] = Object.assign({}, newBoard[selectedPiece[0]][selectedPiece[1]]);
    newBoard[selectedPiece[0]][selectedPiece[1]] = {
        isHighlighted: false,
        occupantType: 'NONE'
    };

    // If the move was a jump, we need to check if the piece can jump again. If so, transition to the extra movement state.
    if (possibleMoves[moveIndex].isJump === true) {
        const jumpOver = possibleMoves[moveIndex].jumpPos;
        newBoard[jumpOver[0]][jumpOver[1]] = {
            isHighlighted: false,
            occupantType: 'NONE'
        };
        let pMoves = FindPossibleMove(newBoard, playerType, GetDirection(playerType), selectedSquare[0], selectedSquare[1]);

        var secondaryMovement = false;
        for (var c = 0; c < pMoves.length; c++) {
            if (pMoves[c].isJump === true) {
                secondaryMovement = true;
                break;
            }
        }
        // Jump available, this piece must move again.
        if (secondaryMovement) {
            setSelectedPiece([selectedSquare[0], selectedSquare[1]]);
            setTurnState(turnStateType.PIECE_EXTRA_MOVEMENT);
        }
    } else {

        setSelectedPiece(null);
        setTurnState(turnStateType.END_TURN);
    }

    setTurn(turn === 0 ? 1 : 0);
    setBoard(removeHighlights(newBoard));

    if (FindPossibleMoves(newBoard, turn === 0 ? "RED" : "BLACK").length === 0) {
        const winner = turn === 0 ? "BLACK" : "RED";
        setWinner(winner);
    }
}

export const GetMoveableUnits = function (grid, playerType) {
    return FindPossibleMoves(grid, playerType);
}

export const CheckersSolver = function (board, setBoard, playerType, setSelectedPiece, selectedPiece, selectedSquare, setTurnState, turnState, turn, setTurn, setWinner) {
    switch (turnState) {
        case turnStateType.PIECE_SELECTION:
            TrySelectPiece(board, playerType, setSelectedPiece, selectedSquare, setTurnState);
            break;
        case turnStateType.PIECE_SELECTED:
            TryMovePiece(board, setBoard, playerType, selectedPiece, setSelectedPiece, selectedSquare, setTurnState, turn, setTurn, setWinner);
            break;
        case turnStateType.PIECE_EXTRA_MOVEMENT:
            TryMovePiece(board, setBoard, playerType, selectedPiece, setSelectedPiece, selectedSquare, setTurnState, turn, setTurn, setWinner);
            break;
        case turnStateType.END_TURN:
            break;
        default:
            console.log("Invalid input.");
            break;
    }
};


/*
let testBoard = Array.from({length: 8}, () => (
    Array.from({length: 8}, () => ({ occupantType: 'NONE' }) )
));

let testBlackPiece = {
    occupantType: 'STANDARD',
    playerType: 'BLACK'
};
let testRedPiece = {
    occupantType: 'STANDARD',
    playerType: 'RED'
};
let testRedKingPiece = {
    occupantType: 'KING',
    playerType: 'RED'
};

testBoard[0][1] = Object.assign({}, testRedPiece);
testBoard[0][3] = Object.assign({}, testRedPiece);
testBoard[0][5] = Object.assign({}, testRedPiece);

testBoard[7][1] = Object.assign({}, testBlackPiece);
testBoard[7][3] = Object.assign({}, testBlackPiece);
testBoard[7][5] = Object.assign({}, testBlackPiece);

//testBoard[0][7] = Object.assign({}, testRedPiece);
//testBoard[3][3] = Object.assign({}, testRedKingPiece);
//testBoard[4][4] = Object.assign({}, testBlackPiece);

//console.log(FindPossibleMoves(testBoard, 'RED'));
console.log(FindPossibleMoves(testBoard, 'BLACK'));

//TrySelectPiece(testBoard, 'RED', null, null, [0, 0], null);
//TrySelectPiece(testBoard, 'RED', null, null, [3, 3], null);
*/