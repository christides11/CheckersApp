import { collection, doc, documentId, getDoc, getDocs, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DeadCenter from "../components/DeadCenter";
import Page from "../Page";
import { db } from "../services/firebase";
import { Board, boardColors, Cell, Piece } from "./LocalMatch";
import { OpponentDisplay, SelfDisplay } from "./OnlineMatch";


const Content = ({ matchId }) => {
  const [board, setBoard] = useState();
  const [player1, setPlayer1] = useState();
  const [player2, setPlayer2] = useState();

  useEffect(() => {
    const loadMatchAsync = async () => {
      console.log("match is", matchId);
      const matchesRef = collection(db, "matches");
      const matchesQuery = query(matchesRef, where(documentId(), "==", matchId), limit(1));
      const querySnapshot = await getDocs(matchesQuery);
      if (querySnapshot.docs.length !== 1) {
        console.log("Match does not exist");
        return;
      }

      const { board, player1: player1ID, player2: player2ID } = querySnapshot.docs[0].data();
      const p1Ref = doc(db, "users", player1ID);
      const p2Ref = doc(db, "users", player2ID);
      const [p1Snap, p2Snap] = await Promise.all([await getDoc(p1Ref), await getDoc(p2Ref)]);
      setPlayer1(p1Snap.data());
      setPlayer2(p2Snap.data());
      setBoard(JSON.parse(board));
      const unsub = onSnapshot(doc(db, "matches", matchId), async (newDoc) => {
        console.log("new snapshot");
        const { board } = newDoc.data();
        setBoard(JSON.parse(board));
      });
    }

    loadMatchAsync();
  }, [matchId]);

  return (
    <DeadCenter>
      {
        board ?
          <>
            {player2 &&
              <OpponentDisplay>
                {player2.username} ({player2.currentELO})
              </OpponentDisplay>
            }
            <Board>
              {(() => {
                let color = 1;
                let startingBoard = [];
                for (let i = 0; i < 64; ++i) {
                  let row = Math.floor(i / 8);
                  let col = i % 8;
                  let piece = board[row][col];
                  startingBoard.push(
                    <Cell key={i} color={piece.isHighlighted ? boardColors[2] : boardColors[color]}>
                      {piece.occupantType !== "NONE" &&
                        <Piece variant={piece.playerType} pieceType={piece.occupantType} />
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
            <SelfDisplay>
              {player1 && `${player1.username} (${player1.currentELO})`}
            </SelfDisplay>
          </> :
          <>Loading match...</>
      }
    </DeadCenter>
  )
}

const SpectateMatch = () => {
  const { matchId } = useParams();

  return <Page content={<Content matchId={matchId} />} />
}

export default SpectateMatch;