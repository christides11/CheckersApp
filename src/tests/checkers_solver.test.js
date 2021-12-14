import {GetMoveableUnits, turnStateType} from './../services/checkers_solver';

// Test Board set up
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
		let testBlackKingPiece = {
		    occupantType: 'KING',
		    playerType: 'BLACK'
		};

describe('check Board Status and Set Up', () => {
	beforeEach(() => {
		// Reset testboard
		testBoard = Array.from({length: 8}, () => (
		    Array.from({length: 8}, () => ({ occupantType: 'NONE' }) )
		));
	});

	test('The other player has no pieces', () => {
		testBoard[0][1] = Object.assign({}, testRedPiece);
		testBoard[0][3] = Object.assign({}, testRedPiece);
		testBoard[0][5] = Object.assign({}, testRedPiece);

		let actual = GetMoveableUnits(testBoard, 'BLACK');
		expect(actual).toEqual([]);
		
	});

	test('The current player has no pieces', () => {
		testBoard[0][1] = Object.assign({}, testRedPiece);
		testBoard[0][3] = Object.assign({}, testRedPiece);
		testBoard[0][5] = Object.assign({}, testRedPiece);

		let actual = GetMoveableUnits(testBoard, 'BLACK');
		expect(actual).toEqual([]);
	});

	test('empty board', () => {
		let actual = GetMoveableUnits(testBoard, 'RED');
		expect(actual).toEqual([]);
	});

	test('Jump move for player', () => {
		// Sample Red Pieces
		testBoard[0][0] = Object.assign({}, testRedPiece);
		testBoard[0][2] = Object.assign({}, testRedPiece);
		testBoard[0][4] = Object.assign({}, testRedPiece);
		testBoard[2][2] = Object.assign({}, testRedPiece);

		// Sample Black Pieces
		testBoard[7][1] = Object.assign({}, testBlackPiece);
		testBoard[7][3] = Object.assign({}, testBlackPiece);
		testBoard[7][5] = Object.assign({}, testBlackPiece);
		testBoard[3][3] = Object.assign({}, testBlackPiece);

		// For Red piece
		let actual = GetMoveableUnits(testBoard, 'RED');
		let actual_coordinates = actual[0]['possiblePosition'];

		expect(actual_coordinates).toEqual([4,4]);

		// For Black piece
		actual = GetMoveableUnits(testBoard, 'BLACK');
		actual_coordinates = actual[0]['possiblePosition'];

		expect(actual_coordinates).toEqual([1,1]);

	});

	test('Move King piece', () => {
		// Sample Red Pieces
		testBoard[0][0] = Object.assign({}, testRedPiece);
		testBoard[0][2] = Object.assign({}, testRedPiece);
		testBoard[0][4] = Object.assign({}, testRedPiece);
		testBoard[2][2] = Object.assign({}, testRedKingPiece);

		// Sample Black Pieces
		testBoard[7][1] = Object.assign({}, testBlackPiece);
		testBoard[7][3] = Object.assign({}, testBlackPiece);
		testBoard[7][5] = Object.assign({}, testBlackPiece);
		testBoard[4][4] = Object.assign({}, testBlackKingPiece);

		let actual = GetMoveableUnits(testBoard, 'RED');
		var actual_moves = [];
		let expected = [[1, 1], [1, 1], [1, 3], [1, 3], [1, 5], [3, 3], [1, 3], [3, 1], [1, 1]];

		for (let i = 0; i < actual.length; i++) {
			actual_moves.push(actual[i]['possiblePosition']);
		}
		expect(actual_moves).toEqual(expected);

		actual = GetMoveableUnits(testBoard, 'BLACK');
		actual_moves = [];
		expected = [[3,3], [5,3], [3,5], [5,5], [6,2], [6,0], [6,4], [6,2], [6,6], [6,4]];

		for (let i = 0; i < actual.length; i++) {
			actual_moves.push(actual[i]['possiblePosition']);
		}
		expect(actual_moves).toEqual(expected);
	});
});

