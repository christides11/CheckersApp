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

let turnStateType = {
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
    "STANDARD": [[1, 1], [-1, 1]],
    "KING": [[1, 1], [-1, 1], [1, -1], [-1, -1]]
}

let playerType = {
    RED: 'RED', // Bottom player.
    BLACK: 'BLACK' // Top player.
}

let IsPositionWithinBounds = function(size, x, y){
    if(x < 0 || x >= size || y < 0 || y >= size) return false;
    return true;
}

let FindPossibleMoves = function(board, playerType, filterJumps = true){
    var possibleMoves = []; // Move : [piecePosition : array, possiblePosition : array, isJump : boolean]
    var direction = 1 * (playerType === 'RED' ? 1 : -1); // Top player is going downwards, so we need to flip their movement.
    var jumpExist = false;

    for(var x = 0; x < board.length; x++){
        for(var y = 0; y < board[0].length; y++){
            if(board[x][y].occupantType === boardSquareOccupantType.NONE) continue;
            if(board[x][y].playerType !== playerType) continue;
            
            // Try all the movements this piece has available.
            var currentPieceMovement = pieceMovement[board[x][y].occupantType];
            for(var i = 0; i < currentPieceMovement.length; i++){
                // Apply the player's direction.
                currentPieceMovement[i] = [currentPieceMovement[i][0] * direction, currentPieceMovement[i][1] * direction];
                var wantedPosition = [x + currentPieceMovement[i][0], y + currentPieceMovement[i][1]];
                if(IsPositionWithinBounds(board.length, wantedPosition[0], wantedPosition[1]) === false) continue;

                if(board[wantedPosition[0]][wantedPosition[1]].occupantType === boardSquareOccupantType.NONE){
                    possibleMoves.push({ piecePosition: [x, y], possiblePosition: [wantedPosition[0], wantedPosition[1]], isJump: false });
                    continue;
                }

                if(board[wantedPosition[0]][wantedPosition[1]].playerType === playerType) continue;
                // Another player's checker is at this position, check if we can jump it.
                wantedPosition = [wantedPosition[0] + currentPieceMovement[i][0], wantedPosition[1] + currentPieceMovement[i][1]];
                if(IsPositionWithinBounds(board.length, wantedPosition[0], wantedPosition[1]) === false) continue;
                if(board[wantedPosition[0]][wantedPosition[1]].occupantType !== boardSquareOccupantType.NONE) continue;
                // Jump available.
                possibleMoves.push({ piecePosition: [x, y], possiblePosition: [wantedPosition[0], wantedPosition[1]], isJump: true });
                jumpExist = true;
            }
        }
    }

    if(filterJumps && jumpExist){
        for(var c = possibleMoves.length-1; c >= 0; c--){
            if(possibleMoves[c].isJump === false) possibleMoves.splice(c, 1);
        }
    }

    return possibleMoves;
}

// Sees if the user selected a piece. If the piece is a valid pick, we'll go to the move state.
let TrySelectPiece = function(board, playerType, setSelectedPiece, selectedPiece, selectedSquare, setTurnState){
    let possibleMoves = FindPossibleMoves(board, playerType, true);

    let foundPiece = false;
    for(var i = 0; i < possibleMoves.length; i++){
        if(possibleMoves[i].piecePosition[0] === selectedSquare[0] && possibleMoves[i].piecePosition[1] === selectedSquare[1]){
            foundPiece = true;
            break;
        }
    }
    if(foundPiece === false){
        console.log(selectedSquare + " can not move this turn.");
        return null;
    }

    console.log(selectedSquare + " can move.");
    // TODO: Return possible moves for specific piece only.
    return possibleMoves;
}

let TryMovePiece = function(setSelectedPiece, selectedPiece, selectedSquare, setTurnState){

}

let HandlerPieceExtraMovement = function(selectedPiece, selectedSquare, setTurnState){

}

exports.GetMoveableUnits = function(grid, playerType){
    return FindPossibleMoves(grid, playerType);
}

exports.CheckersSolver = function(grid, playerType, setSelectedPiece, selectedPiece, selectedSquare, setTurnState, turnState) {
    switch(turnState){
        case turnStateType.PIECE_SELECTION:
            TrySelectPiece(grid, playerType, setSelectedPiece, selectedPiece, selectedSquare, setTurnState);
            break;
        case turnStateType.PIECE_SELECTED:
            TryMovePiece(setSelectedPiece, selectedPiece, selectedSquare, setTurnState);
            break;
        /*case turnStateType.PIECE_EXTRA_MOVEMENT:
            HandlerPieceExtraMovement(selectedPiece, selectedSquare, setTurnState);
            break;*/
        case turnStateType.END_TURN:
            break;
        default:
            console.log("Invalid input.");
            break;
    }
};

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

testBoard[0][0] = Object.assign({}, testRedPiece);
testBoard[1][1] = Object.assign({}, testRedPiece);
testBoard[2][0] = Object.assign({}, testRedPiece);
testBoard[3][3] = Object.assign({}, testRedKingPiece);
testBoard[4][4] = Object.assign({}, testBlackPiece);

console.log(FindPossibleMoves(testBoard, 'RED'));
console.log(FindPossibleMoves(testBoard, 'BLACK'));

TrySelectPiece(testBoard, 'RED', null, null, [0, 0], null);
TrySelectPiece(testBoard, 'RED', null, null, [3, 3], null);