import { collection, getDocs, limit, orderBy, query, where, getFirestore, startAfter } from "firebase/firestore";
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { default as PlayButton_m } from '../components/PlayButton';
import { default as DeadCenter_m } from '../components/DeadCenter';
import Page from '../Page';
import { db } from "../services/firebase";
import { Button, Dropdown, Form, FloatingLabel, Modal, Pagination, ListGroup, Spinner} from 'react-bootstrap';

const PlayButton = styled(PlayButton_m)`
word-wrap: break-word;
    &:not(:first-child) {
        margin-top: 42px;
    }
`;

const DeadCenter = styled(DeadCenter_m)`
    text-align: center;
`;

const RankList = styled.ol`
  text-align: left;
`;

const Content = () => {
  const [currentDocs, setCurrentDocs] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [dict, setDict] = useState({});

  useEffect(() => {
    let mounted = true;
    if(currentDocs !== null) return () => mounted = false;
    
    async function GetC(){
      const db = getFirestore();

      // Query the first page of docs
      const firstDoc = lastVisible === null ? query(collection(db, "matches"), orderBy("created"), limit(10)) 
        : query(collection(db, "matches"), orderBy("created"), startAfter(lastVisible), limit(10));
      const genDocs = await getDocs(firstDoc);
      if(mounted){
        // Get the last visible document
        const lastVis = genDocs.docs[genDocs.docs.length-1];
        if(genDocs.docs[0] === null || genDocs.docs[0] === undefined){
          setLastVisible(null);
          setCurrentDocs(null);
          return () => mounted = false;
        }
        setCurrentDocs(genDocs);
        setLastVisible(lastVis);
      }

      // Get Challenges
      /*const challengesDocRequest = query(collection(db, "matches"), orderBy("created"), limit(10));
      const challengesDoc = await getDocs(challengesDocRequest);
      if(mounted){
          const lastVis = challengesDoc.docs[challengesDoc.docs.length-1];
          const tempDict = dict;
          setCurrentDocs(challengesDoc);
          setLastVisible(lastVis);
      }*/
    }
    GetC();

    return () => mounted = false;
  }, [currentDocs, lastVisible, dict]);

    function JoinMatch(matchObj){
      console.log("Joining match " + matchObj.id);
      // TODO: Join match and specate.
    }

    function rowOfTiles(id, rowObj) {
      return (
        <PlayButton to="/spectate" onClick={() => JoinMatch(rowObj)} key={id}> {rowObj.id} (turn {rowObj.data().turn})</PlayButton>
      );
  }

  function ShowContents(){
      return (
          <nav>
            {currentDocs.docs.map((e, l, i) => {
                return rowOfTiles(l, e);
            })}
          </nav>
        );
  }

  function nextPage(){
    if(lastVisible === null || lastVisible === undefined){
      setLastVisible(null);
    }
    setCurrentDocs(null);
  }

    return (
    <DeadCenter>
      {currentDocs === null &&
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Finding Matches...</span>
        </Spinner>
      }

      {currentDocs !== null &&
        <nav>
          {ShowContents()}
          <Button variant="outline-primary" onClick={() => nextPage()}>Next Page</Button>
        </nav>
      }
    </DeadCenter>
    )
};

const SpectateList = () => (
  <Page content={<Content />} />
);

export default SpectateList;