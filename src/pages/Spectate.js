import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { default as DeadCenter_m } from '../components/DeadCenter';
import Page from '../Page';
import { db } from "../services/firebase";

const DeadCenter = styled(DeadCenter_m)`
    text-align: center;
`;

const RankList = styled.ol`
  text-align: left;
`;

const Content = () => {
    const [matchList, setMatchList] = useState();

    useEffect(() => {
        const fetchRankings = async () => {
            const matchesRef = collection(db, "matches");
            const createdQuery = query(matchesRef, orderBy("created", "desc"), limit(10));
            const querySnapshot = await getDocs(createdQuery);
            const matches = querySnapshot.docs.map(doc => {
                const userData = doc.data();
                return { id: doc.id, turn: userData.turn }
            });
            setMatchList(matches);
        }

        fetchRankings();
    }, []);

    return (
    <DeadCenter>
      {matchList && (
        <RankList>
          {
            matchList.map(({ id, turn }, idx) =>
              <li key={idx}>{id} (turn {turn})</li>
            )
          }
        </RankList>
      )}
    </DeadCenter>
    )
};

const Spectate = () => (
  <Page content={<Content />} />
);

export default Spectate;