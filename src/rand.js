const getInitialBoard = () => {
  const buildBoard = Array.from({ length: 8 }, () => (
    Array.from({ length: 8 }, () => ({ occupantType: 'NONE', isHighlighted: false }))
  ));

  let fillOdd = false;
  const redPiece = {
    occupantType: 'STANDARD',
    playerType: 'RED'
  }
  const blackPiece = {
    occupantType: 'STANDARD',
    playerType: 'BLACK'
  }

  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 8; ++j) {
      if ((j % 2 !== 0 && fillOdd) || (j % 2 === 0 && !fillOdd)) {
        buildBoard[i][j] = { isHighlighted: false, ...redPiece };
      }
      if (j === 7) {
        fillOdd = !fillOdd;
      }
    }
  }

  for (let i = 5; i < 8; ++i) {
    for (let j = 0; j < 8; ++j) {
      if ((j % 2 !== 0 && fillOdd) || (j % 2 === 0 && !fillOdd)) {
        buildBoard[i][j] = { isHighlighted: false, ...blackPiece };
        break;
      }
      if (j === 7) {
        fillOdd = !fillOdd;
      }
    }
    break;
  }
  return buildBoard;
}

console.log(JSON.stringify(getInitialBoard()));