import OnlineMatch from './../pages/OnlineMatch';
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


test('Player moves at wrong time', () => {});

test('Move pieces for each turn', () => {
		// Sample Red Pieces
		testBoard[0][0] = Object.assign({}, testRedPiece);
		testBoard[0][2] = Object.assign({}, testRedPiece);
		testBoard[0][4] = Object.assign({}, testRedPiece);

		// Sample Black Pieces
		testBoard[7][1] = Object.assign({}, testBlackPiece);
		testBoard[7][3] = Object.assign({}, testBlackPiece);
		testBoard[7][5] = Object.assign({}, testBlackPiece);

		// Decide how to test movement
	});