import { useEffect, useState } from "react";
import styled from 'styled-components';
import { default as DeadCenter_m } from '../components/DeadCenter';
import Page from '../Page';
import { GetMoveableUnits } from "../services/checkers_solver";

const boardColors = ["#FFCF9F", "#D28C45", "#704923"];

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
  background: ${({ color }) => color};
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

const Content = () => {
  const [board, setBoard] = useState();
  const [selectedPiece, setSelectedPiece] = useState();
  const [turn, setTurn] = useState(0);

  useEffect(() => {
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
        {board && (() => {
          let color = 1;
          let startingBoard = [];
          for (let i = 0; i < 64; ++i) {
            let row = Math.floor(i / 8);
            let col = i % 8;
            let piece = board[row][col];
            startingBoard.push(
              <Cell id={i} color={piece.isHighlighted ? boardColors[3] : boardColors[color]}>
                {piece.occupantType !== "NONE" &&
                  <Piece variant={piece.playerType}
                    onClick={() => {
                      // console.log(FindPossibleMove(board, piece.playerType, 1, row, col));
                      console.log("Moves", GetMoveableUnits(board, piece.playerType));
                      if ((turn === 0 && piece.playerType === "BLACK") || (turn === 1 && piece.playerType === "RED")) {
                        const moveableUnits = GetMoveableUnits(board, piece.playerType);
                        const [movePosition] = moveableUnits.filter((moveableUnit) => {
                          return moveableUnit.piecePosition[0] === row
                            && moveableUnit.piecePosition[1] === col;
                        });

                        if (!movePosition) {
                          return;
                        }
                        // console.log([row, col])
                        // console.log(moveableUnits)
                        // console.log(movePosition);
                        // const newBoard = board.map((row, i) => {
                        //   return row.map((col, j) => {
                        //     if (i === )
                        //   });
                        // })
                      }

                      // CheckersSolver(board, setBoard, piece.playerType, [row, col])
                      console.log(row, col);
                    }}
                  />
                }
              </Cell>
            );
            color = color === 0 ? 1 : 0;
            if ((i + 1) % 8 === 0) {
              color = color === 0 ? 1 : 0;
            }
          }
          return startingBoard;
        })()}
      </Board>
    </DeadCenter>
  )
};

const LocalMatch = () => (
  <Page content={<Content />} />
);

export default LocalMatch;