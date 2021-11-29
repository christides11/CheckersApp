import { addDoc, collection, doc, getDocs, limit, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import _ from "lodash";
import { useEffect, useState } from "react";
import Page from "../Page";
import { useAuth } from '../services/AuthContext';
import { CheckersSolver, GetMoveableUnits, playerType, turnStateType } from "../services/checkers_solver";
import { db } from "../services/firebase";
import { Board, boardColors, Cell, DeadCenter, getInitialBoard, Piece } from "./LocalMatch";

const rotate180 = (board) => {
  const newBoard = [];
  const chunkedBoard = _.chunk(board, 8);
  for (let i = 7; i >= 0; --i) {
    chunkedBoard[i].reverse();
    newBoard.push(chunkedBoard[i]);
  }
  return newBoard;
}

const Content = () => {
  const { currentUser } = useAuth();
  const [board, setBoard] = useState();
  const [selectedPiece, setSelectedPiece] = useState();
  const [turn, setTurn] = useState(0);
  const [turnState, setTurnState] = useState(turnStateType.PIECE_SELECTION);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [winner, setWinner] = useState();
  const [shouldResetStates, setShouldResetStates] = useState(false);
  const [gameID, setGameID] = useState();

  // helps to know if to turn board upside down or not
  const [whichPlayer, setWhichPlayer] = useState();

  useEffect(() => {
    const loadGameAsync = async () => {
      let gameID = null;
      const matchesRef = collection(db, "matches");
      const matchesQuery = query(matchesRef, where("player2", "==", ""), where("player1", "!=", currentUser.authData.uid), limit(1));
      // const matchesQuery = query(matchesRef, where(documentId(), "==", "JV4ligcxt4ONdOEvsnI7"), limit(1));
      const querySnapshot = await getDocs(matchesQuery);
      if (querySnapshot.docs.length === 1) {
        const gameData = querySnapshot.docs[0].data();
        gameID = querySnapshot.docs[0].id;
        updateDoc(doc(db, "matches", gameID), { player2: currentUser.authData.uid }, { merge: true });
        setGameInProgress(true);
        setBoard(JSON.parse(gameData.board));
        setGameID(gameID);

        // set player to red since this player is the guest
        setWhichPlayer(1);
      } else {
        // generate board
        const board = JSON.stringify(getInitialBoard());
        // make new match
        const docRef = await addDoc(matchesRef, {
          player1: currentUser.authData.uid,
          player2: "",
          finished: false,
          spectators: [],
          created: serverTimestamp(),
          turn: 0,
          board
        });

        gameID = docRef.id;
        setWhichPlayer(0);
        setGameID(gameID);
      }

      // TODO: call unsub when game over
      const unsub = onSnapshot(doc(db, "matches", gameID), (doc) => {
        const newData = doc.data();
        console.log(newData.board);
        if (newData.board && newData.board.length > 0) {
          setBoard(JSON.parse(newData.board));
        }

        setTurn(newData.turn);

        // player2 joined 
        if (!gameInProgress && newData.player2.length !== 0) {
          setGameInProgress(true);
        }
      });
    }
    loadGameAsync();
  }, []);

  const setBoardOnline = async (board) => {
    if (!gameInProgress) {
      return;
    }

    updateDoc(doc(db, "matches", gameID), { board: JSON.stringify(board) }, { merge: true });
  }

  const setTurnOnline = async (turn) => {
    if (!gameInProgress) {
      return;
    }

    updateDoc(doc(db, "matches", gameID), { turn }, { merge: true });
  }

  return gameInProgress ?
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
                    CheckersSolver(board, setBoardOnline, player, setSelectedPiece, selectedPiece, [row, col],
                      setTurnState, turnStateType.PIECE_SELECTED, turn, setTurnOnline, setWinner);
                  }
                }}>
                {piece.occupantType !== "NONE" &&
                  <Piece variant={piece.playerType}
                    onClick={() => {
                      console.log(GetMoveableUnits(board, piece.playerType));
                      console.log("Row:", row, "Col:", col)
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

                        CheckersSolver(board, setBoardOnline, piece.playerType, setSelectedPiece,
                          selectedPiece, [row, col], setTurnState, turnStateType.PIECE_SELECTION,
                          turn, setTurnOnline, setWinner);

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
          return whichPlayer === 0 ? startingBoard : rotate180(startingBoard);
        })()}
      </Board>
      <button onClick={() => {
        console.log("Turn State:", turnState, "Turn:", turn);
      }}>Log State</button>
    </DeadCenter>
    : <DeadCenter>
      Finding Player...
    </DeadCenter>

};

const OnlineMatch = () => (
  <Page
    content={<Content />}
  // content={<>Hello</>}
  />
);

export default OnlineMatch;