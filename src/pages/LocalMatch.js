import { useEffect, useState } from "react";
import styled from 'styled-components';
import { default as DeadCenter_m } from '../components/DeadCenter';
import Page from '../Page';


const DeadCenter = styled(DeadCenter_m)`
    text-align: center;
`;

const Board = styled.div`
  width: 576px;
  height: 576px;
  background: #f00; 
  display: flex;
  flex-wrap: wrap;
`;

const Cell = styled.div`
  width: 72px;
  height: 72px;
  display: flex;
  background: ${({ color }) => color === 0 ? "#FFCF9F" : "#D28C45"};
`;

const Piece = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin: auto;
  border: 5px solid #FFF;
  background: ${({ variant }) => variant === "RED" ? "#F00" : "#000"};
`;

const Break = styled.div`
  width: 100%;
  background: #0f0;
`;

const getStartingBoard = (board) => {
  let color = 0;
  let startingBoard = [];
  for (let i = 0; i < 64; ++i) {
    let row = Math.floor(i / 8);
    let col = i % 8;
    let piece = board[row][col];
    startingBoard.push(
      <Cell id={i} color={color}>
        {piece.occupantType !== "NONE" && <Piece variant={piece.playerType} />}
      </Cell>
    );
    color = color === 0 ? 1 : 0;
    if ((i + 1) % 8 === 0) {
      color = color === 0 ? 1 : 0;
    }
  }
  return startingBoard;
}

const Content = () => {
  const [board, setBoard] = useState();

  useEffect(() => {
    const buildBoard = Array.from({ length: 8 }, () => (
      Array.from({ length: 8 }, () => ({ occupantType: 'NONE' }))
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
          buildBoard[i][j] = { ...redPiece };
        }
        if (j === 7) {
          fillOdd = !fillOdd;
        }
      }
    }

    for (let i = 5; i < 8; ++i) {
      for (let j = 0; j < 8; ++j) {
        if ((j % 2 !== 0 && fillOdd) || (j % 2 === 0 && !fillOdd)) {
          buildBoard[i][j] = { ...blackPiece };
        }
        if (j === 7) {
          fillOdd = !fillOdd;
        }
      }
    }

    console.log(buildBoard);
    setBoard(buildBoard)
  }, []);

  return (
    <DeadCenter>
      <Board>
        {board && getStartingBoard(board)}
      </Board>
    </DeadCenter>
  )
};

const LocalMatch = () => (
  <Page content={<Content />} />
);

export default LocalMatch;