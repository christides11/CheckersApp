import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import { default as DeadCenter_m } from '../components/DeadCenter';
import Page from '../Page';
import { CheckersSolver, GetMoveableUnits, playerType, turnStateType } from "../services/checkers_solver";

export const boardColors = ["#FFCF9F", "#D28C45", "#704923"];

export const getInitialBoard = () => {
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

  return buildBoard;
}

export const DeadCenter = styled(DeadCenter_m)`
    text-align: center;
`;

export const Board = styled.div`
  width: 576px;
  height: 576px;
  display: flex;
  flex-wrap: wrap;
`;

export const Cell = styled.div`
  width: 72px;
  height: 72px;
  display: flex;
  background: ${({ color }) => color};
`;

export const Piece = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin: auto;
  border: 5px solid #FFF;
  background-color: ${({ variant }) => variant === "RED" ? "#F00" : "#000"};
  background-repeat: no-repeat;
  background-position: center; 
  background-size: 65%;
  background-image: ${({ pieceType }) => pieceType === "KING" ? "url('/king.png')" : "url('/blank.png')"};
`;

export const TurnIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin: auto;
  border: 5px solid #FFF;
  background-color: ${({ t }) => t === 1 ? "#F00" : "#000"};
`;

export const ModalBackground = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  background: rgba(0,0,0,0.3);
  display: flex;
  font-family: Montserrat, sans-serif;
  font-size: 24px;
  color: #FFF;
`;

export const ModalBody = styled.div`
  background: #787878;
  width: 300px;
  height: 361px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const MenuButton = styled.button`
   text-decoration: none;
    &:hover {
        background: #696e74;
    }
    display: inline-block;
    background: #52565A;
    color: #FFF;
    font-size: 24px;
    border: none;
    outline: inherit;
    cursor: pointer;
    width: 240px;
    height: 60px;
`;

export const PlayAgainButton = styled(MenuButton)`
      margin-bottom: 25px;
      background: #19A017;
      &:hover {
        background: #158613;
    }
`;

const Modal = ({ winner, setShouldResetStates, shouldResetStates }) => {
  let navigate = useNavigate();
  return <ModalBackground>
    <DeadCenter>
      <ModalBody>
        {winner === playerType.RED ? "Red" : "Black"} Won!
        <div>
          <PlayAgainButton onClick={() => {
            setShouldResetStates(!shouldResetStates);
          }}>
            Play again
          </PlayAgainButton>
          <MenuButton onClick={() => {
            setShouldResetStates(!shouldResetStates);
            navigate('/')
          }}>
            Return to Menu
          </MenuButton>
        </div>
      </ModalBody>
    </DeadCenter>
  </ModalBackground>
};


const Content = ({ setWinner, shouldResetStates }) => {
  const [board, setBoard] = useState();
  const [selectedPiece, setSelectedPiece] = useState();
  const [turn, setTurn] = useState(0);
  const [turnState, setTurnState] = useState(turnStateType.PIECE_SELECTION);

  useEffect(() => {
    setSelectedPiece(null);
    setTurn(0);
    setTurnState(turnStateType.PIECE_SELECTION);
    setWinner(null);
  }, [shouldResetStates, setSelectedPiece, setTurn, setTurnState, setWinner]);

  useEffect(() => {
    const buildBoard = getInitialBoard();

    setBoard(buildBoard)
  }, [shouldResetStates]);

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
              <Cell key={i} color={piece.isHighlighted ? boardColors[2] : boardColors[color]}
                onClick={async () => {
                  if (piece.occupantType === "NONE" && piece.isHighlighted) {
                    const player = turn === 0 ? playerType.BLACK : playerType.RED;
                    CheckersSolver(board, setBoard, player, setSelectedPiece, selectedPiece, [row, col],
                      setTurnState, turnStateType.PIECE_SELECTED, turn, setTurn, setWinner);
                  }
                }}>
                {piece.occupantType !== "NONE" &&
                  <Piece variant={piece.playerType} pieceType={piece.occupantType}
                    onClick={() => {
                      if ((turn === 0 && piece.playerType === "BLACK") || (turn === 1 && piece.playerType === "RED")) {
                        const moveableUnits = GetMoveableUnits(board, piece.playerType);
                        const movePositions = moveableUnits.filter((moveableUnit) => {
                          return moveableUnit.piecePosition[0] === row
                            && moveableUnit.piecePosition[1] === col;
                        });

                        if (movePositions.length === 0) {
                          return;
                        }

                        const hashedPositionsList = movePositions.map(({ possiblePosition }) => {
                          return `${possiblePosition[0]}|${possiblePosition[1]}`;
                        });

                        CheckersSolver(board, setBoard, piece.playerType, setSelectedPiece,
                          selectedPiece, [row, col], setTurnState, turnStateType.PIECE_SELECTION,
                          turn, setTurn, setWinner);

                        const newBoard = board.map((row, i) => {
                          return row.map((cell, j) => {
                            const hashedCell = `${i}|${j}`;
                            if (hashedPositionsList.includes(hashedCell)) {
                              return { ...cell, isHighlighted: true }
                            }
                            return { ...cell, isHighlighted: false }
                          });
                        });

                        // can remove piece highlights here if necessary
                        setBoard(newBoard);
                      }
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
      <button onClick={() => {
        console.log("Turn State:", turnState);
      }}>Log State</button>
      <TurnIcon t={turn}></TurnIcon>
    </DeadCenter>
  )
};

const LocalMatch = () => {
  const [winner, setWinner] = useState();
  const [shouldResetStates, setShouldResetStates] = useState(false);

  return (
    <>
      {winner &&
        <Modal winner={winner} setShouldResetStates={setShouldResetStates} shouldResetStates={shouldResetStates} />
      }
      <Page
        content={<Content
          setWinner={setWinner}
          shouldResetStates={shouldResetStates} />}
      />
    </>
  );
};

export default LocalMatch;