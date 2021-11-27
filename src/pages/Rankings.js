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
  const [rankingsList, setRankingsList] = useState();

  useEffect(async () => {
    const usersRef = collection(db, "users")
    const rankingsQuery = query(usersRef, orderBy("currentELO", "desc"), limit(10));
    const querySnapshot = await getDocs(rankingsQuery);
    const rankings = querySnapshot.docs.map(doc => {
      const userData = doc.data();
      return { username: userData.username, elo: userData.currentELO }
    });
    console.log(rankings);
    setRankingsList(rankings);
  }, []);

  return (
    <DeadCenter>
      {rankingsList && (
        <RankList>
          {
            rankingsList.map(({ username, elo }, idx) =>
              <li id={idx}>{username} ({elo})</li>
            )
          }
        </RankList>
      )}
    </DeadCenter>
  )
};

const Rankings = () => (
  <Page content={<Content />} />
);

export default Rankings;