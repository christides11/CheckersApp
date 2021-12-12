import EloRating from "elo-rating";
import { addDoc, collection, doc, getDoc, getDocs, limit, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import _ from "lodash";
import { useEffect, useReducer, useRef, useState } from "react";
import styled from "styled-components";
import Page from "../Page";
import { useAuth } from '../services/AuthContext';
import { CheckersSolver, GetMoveableUnits, playerType, turnStateType } from "../services/checkers_solver";
import { db } from "../services/firebase";
import useFirstRender from "../services/firstrender";
import { Board, boardColors, Cell, DeadCenter, getInitialBoard, MenuButton, ModalBackground, ModalBody, Piece, PlayAgainButton } from "./LocalMatch";

const TURN_TIME_LIMIT = 15;
const PlayersList = ["BLACK", "RED"];
let timeRemainingCounter;
let unsub;

const rotate180 = (board) => {
  const newBoard = [];
  const chunkedBoard = _.chunk(board, 8);
  for (let i = 7; i >= 0; --i) {
    chunkedBoard[i].reverse();
    newBoard.push(chunkedBoard[i]);
  }
  return newBoard;
}

export const OpponentDisplay = styled.div`
  text-align: right;
  margin-bottom: 10px;
`;

export const SelfDisplay = styled.div`
 text-align: left;
  margin-top: 10px;
`;

const Gameview = styled.div`
  display: flex;
`;

const TimeView = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 10px;
  padding-top: 40px;
  justify-content: space-between;
`;

const Modal = ({ winner, whichPlayer, opponent, eloIncrease }) => {
  const { currentUser } = useAuth();
  // if youre're black and black won
  let winnerObject;
  if ((winner === playerType.BLACK && whichPlayer === 0) ||
    (winner === playerType.RED && whichPlayer === 1)) {
    winnerObject = currentUser
  } else {
    winnerObject = opponent;
  }
  return <ModalBackground>
    <DeadCenter>
      <ModalBody>
        {winnerObject.username} Won!
        <div>
          {winnerObject.lastUpdatedELO} (+{eloIncrease})
        </div>
        <div>
          <PlayAgainButton onClick={() => {
            window.location.reload();
          }}>
            Find New Match
          </PlayAgainButton>
          <MenuButton onClick={() => {
            window.location.replace("/");
          }}>
            Return to Menu
          </MenuButton>
        </div>
      </ModalBody>
    </DeadCenter>
  </ModalBackground>
};

const formatTime = (seconds) => {
  let minutes = Math.floor(seconds % 60);
  if (minutes < 10) {
    minutes = '0' + String(minutes);
  }
  return `${Math.floor(seconds / 60)}:${minutes}`
}

const Content = ({ setWinner, whichPlayer, setWhichPlayer, opponent, setOpponent, setEloIncrease }) => {
  const { currentUser } = useAuth();
  const [board, setBoard] = useState();
  const [selectedPiece, setSelectedPiece] = useState();
  const [turn, setTurn] = useState(0);
  const [turnState, setTurnState] = useState(turnStateType.PIECE_SELECTION);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameID, setGameID] = useState();
  const firstRender = useFirstRender();

  // used to refresh time function since just setInterval isn't friends with state information
  const [shouldRefreshTimeFunction, setShouldRefreshTimeFunction] = useState(false);

  // used in onsnapshot to prevent infinite writes
  const gameInProgressRef = useRef(false);

  const setWinnerOnline = async (winner, gameID) => {
    if (!gameInProgressRef.current) {
      return;
    }

    let thisUserWon;
    if ((winner === playerType.BLACK && whichPlayer === 0) ||
      (winner === playerType.RED && whichPlayer === 1)) {
      thisUserWon = true;
    } else {
      thisUserWon = false;
    }
    const { playerRating, opponentRating } = EloRating.calculate(currentUser.currentELO, opponent.currentELO, thisUserWon);
    const updatePlayerElo = updateDoc(doc(db, "users", currentUser.authData.uid), { currentELO: playerRating }, { merge: true });
    const updateOpponentElo = updateDoc(doc(db, "users", opponent.uid), { currentELO: opponentRating }, { merge: true });
    setEloIncrease(Math.max(playerRating - currentUser.currentELO, opponentRating - opponent.currentELO));
    await Promise.all([
      await updatePlayerElo,
      await updateOpponentElo,
      await updateDoc(doc(db, "matches", gameID), { finished: true }, { merge: true })
    ]);
    clearInterval(timeRemainingCounter);
    setWinner(winner);
  }

  const timeRemainingReducer = (state, action) => {
    switch (action.type) {
      case 'decrement':
        if (state.timeRemaining === 1) {
          setWinnerOnline(action.data.winner, gameID);
        }
        return { timeRemaining: state.timeRemaining - 1 };
      case 'reset':
        return { timeRemaining: TURN_TIME_LIMIT };
      case 'set':
        return { timeRemaining: action.data.secondsRemainingInTurn };
      default:
        throw new Error();
    }
  }

  const [timeRemainingState, timeRemainingDispatch] = useReducer(timeRemainingReducer, { timeRemaining: 0 });

  const decrementTime = () => {
    timeRemainingDispatch({
      type: 'decrement',
      data: {
        winner: turn === whichPlayer ? PlayersList[1 - whichPlayer] : PlayersList[whichPlayer],
      }
    });
  }

  useEffect(() => {
    if (firstRender) return;
    timeRemainingCounter = setInterval(decrementTime, 1000);
  }, [shouldRefreshTimeFunction]);


  useEffect(() => {
    const loadGameAsync = async () => {
      let gameID = null;
      const matchesRef = collection(db, "matches");

      // if you are already part of a game, join the game

      // separate both queries since there's no OR in firebase
      const currentMatchesQueryP1 = query(matchesRef, where("player1", "==", currentUser.authData.uid), where("finished", "!=", true), limit(1));
      const currentMatchesQueryP2 = query(matchesRef, where("player2", "==", currentUser.authData.uid), where("finished", "!=", true), limit(1));
      const [currentMatchesQuerySnapshotP1, currentMatchesQuerySnapshotP2] = await Promise.all([await getDocs(currentMatchesQueryP1), await getDocs(currentMatchesQueryP2)]);
      const [currentMatch] = [...currentMatchesQuerySnapshotP1.docs, ...currentMatchesQuerySnapshotP2.docs]

      if (currentMatch) {
        const gameData = currentMatch.data();
        const isMatchInProgress = gameData.player2.length > 0;
        gameID = currentMatch.id;
        setGameInProgress(isMatchInProgress);
        gameInProgressRef.current = isMatchInProgress;
        setBoard(JSON.parse(gameData.board));
        setGameID(gameID);

        if (isMatchInProgress) {
          // game in progress, start countdown
          const secondsSinceUTC = Math.floor(new Date() / 1000);
          const secondsRemainingInTurn = TURN_TIME_LIMIT - (secondsSinceUTC - gameData.lastMoveTime.seconds);
          timeRemainingDispatch({ type: 'set', data: { secondsRemainingInTurn } });
          if (!timeRemainingCounter) {
            setShouldRefreshTimeFunction(r => !r);
          }
        }

        // set playertype dependibg on if we are p1 or p2
        setWhichPlayer(gameData.player1 === currentUser.authData.uid ? 0 : 1);
        const opponentPlayerID = gameData.player1 === currentUser.authData.uid ? gameData.player2 : gameData.player1;

        if (opponentPlayerID.length > 0) {
          const opponentPlayerRef = doc(db, "users", opponentPlayerID);
          const opponentPlayerSnap = await getDoc(opponentPlayerRef);
          if (opponentPlayerSnap.exists()) {
            setOpponent({ ...opponentPlayerSnap.data(), uid: opponentPlayerID });
          }
        }
      } else {
        // we are not currently part of a match
        const matchesQuery = query(matchesRef, where("player2", "==", ""), where("player1", "!=", currentUser.authData.uid), limit(1));
        // const matchesQuery = query(matchesRef, where(documentId(), "==", "JV4ligcxt4ONdOEvsnI7"), limit(1));
        const querySnapshot = await getDocs(matchesQuery);
        if (querySnapshot.docs.length === 1) {
          // found a game with a player in it 
          const gameData = querySnapshot.docs[0].data();
          gameID = querySnapshot.docs[0].id;
          setGameID(gameID);
          setWhichPlayer(1);
          updateDoc(doc(db, "matches", gameID), { player2: currentUser.authData.uid }, { merge: true });
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
            board,
            lastMoveTime: null,
          });

          gameID = docRef.id;
          setWhichPlayer(0);
          setGameID(gameID);
        }
      }
    }

    loadGameAsync();
  }, []);

  useEffect(() => {
    if (!gameID) return;
    if (unsub) {
      unsub();
    }
    unsub = onSnapshot(doc(db, "matches", gameID), async (newDoc) => {
      const newData = newDoc.data();
      if (!newData) {
        return;
      }

      if (newData.board && newData.board.length > 0 && newData.board !== board) {
        setBoard(JSON.parse(newData.board));
      }

      if (gameInProgressRef.current) {
        timeRemainingDispatch({ type: 'reset' });
      }

      setTurn(newData.turn);

      // player2 joined, or a player re-joined
      if (!gameInProgress && !gameInProgressRef.current && newData.player2.length !== 0) {
        setGameInProgress(true);
        gameInProgressRef.current = true;
        setGameID(gameID);
        await updateDoc(doc(db, "matches", gameID), { lastMoveTime: serverTimestamp() }, { merge: true });
        timeRemainingDispatch({ type: 'reset' });
        if (!timeRemainingCounter) {
          setShouldRefreshTimeFunction(r => !r);
        }
        const opponentPlayerID = newData.player2 !== currentUser.authData.uid ? newData.player2 : newData.player1;
        const opponentPlayerRef = doc(db, "users", opponentPlayerID);
        const opponentPlayerSnap = await getDoc(opponentPlayerRef);
        if (opponentPlayerSnap.exists()) {
          setOpponent({ ...opponentPlayerSnap.data(), uid: opponentPlayerID });
        }
      }
    });
    return () => unsub();
  }, [gameID, gameInProgress, opponent]);

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

    updateDoc(doc(db, "matches", gameID), { turn, lastMoveTime: serverTimestamp() }, { merge: true });
  }

  return gameInProgress ?
    <DeadCenter>
      <Gameview>
        <div>
          {board && opponent &&
            <OpponentDisplay>
              {opponent.username} ({opponent.currentELO})
            </OpponentDisplay>
          }
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
                          setTurnState, turnStateType.PIECE_SELECTED, turn, setTurnOnline, setWinnerOnline);
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

                            CheckersSolver(board, setBoardOnline, piece.playerType, setSelectedPiece,
                              selectedPiece, [row, col], setTurnState, turnStateType.PIECE_SELECTION,
                              turn, setTurnOnline, setWinnerOnline);

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
        </div>
        <TimeView>
          <div>{turn !== whichPlayer ? formatTime(timeRemainingState.timeRemaining) : '0:00'}</div>
          <div>{turn === whichPlayer ? formatTime(timeRemainingState.timeRemaining) : '0:00'}</div>
        </TimeView>
      </Gameview>
      <SelfDisplay>
        {board && `${currentUser.username} (${currentUser.currentELO})`}
      </SelfDisplay>
      <div>
        {timeRemainingState.timeRemaining}
      </div>
      <button onClick={() => {
        console.log("Turn State:", turnState,
          "Turn:", turn, "Whichplayer", whichPlayer,
          "Game in progress", gameInProgress, "Game inp ref", gameInProgressRef, "Game ID", gameID,
          "Opponent", opponent, "Current user", currentUser);
      }}>Log State</button>
    </DeadCenter>
    : <DeadCenter>
      Finding Player...
    </DeadCenter>

};

const OnlineMatch = () => {
  const [winner, setWinner] = useState();

  // helps to know if to turn board upside down or not
  const [whichPlayer, setWhichPlayer] = useState();
  // opponent player details
  const [opponent, setOpponent] = useState();

  const [eloIncrease, setEloIncrease] = useState();
  return (
    <>
      {winner &&
        <Modal
          winner={winner}
          opponent={opponent}
          eloIncrease={eloIncrease}
          whichPlayer={whichPlayer}
        />
      }
      <Page
        content={
          <Content
            setWinner={setWinner}
            setEloIncrease={setEloIncrease}
            whichPlayer={whichPlayer} setWhichPlayer={setWhichPlayer}
            opponent={opponent} setOpponent={setOpponent}
          />
        }
      />
    </>
  );
}

export default OnlineMatch;