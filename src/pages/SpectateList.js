import { collection, getDocs, limit, orderBy, query, where, getFirestore } from "firebase/firestore";
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { default as DeadCenter_m } from '../components/DeadCenter';
import Page from '../Page';
import { db } from "../services/firebase";
import { Button, Dropdown, Form, FloatingLabel, Modal, Pagination, ListGroup, Spinner} from 'react-bootstrap';

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
      // Get Challenges
      const challengesDocRequest = query(collection(db, "matches"), orderBy("created"), limit(10));
      const challengesDoc = await getDocs(challengesDocRequest);
      if(mounted){
          const lastVis = challengesDoc.docs[challengesDoc.docs.length-1];
          const tempDict = dict;
          setCurrentDocs(challengesDoc);
          setLastVisible(lastVis);
      }
    }
    GetC();

    return () => mounted = false;
  }, [currentDocs, lastVisible, dict]);

    function JoinMatch(matchObj){
      // TODO: Join match and specate.
    }

    function rowOfTiles(id, rowObj) {
      return (
          <ListGroup.Item action onClick={() => JoinMatch(rowObj)} key={id} as="li" className="d-flex justify-content-between align-items-start">
              <div className="ms-2 me-auto">
                  <div className="fw-bold">{rowObj.id} (turn {rowObj.data().turn})</div>
              </div>
          </ListGroup.Item>
      );
  }

  function ShowContents(){
      return (
          <ListGroup>
            {currentDocs.docs.map((e, l, i) => {
                return rowOfTiles(l, e);
            })}
          </ListGroup>
        );
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
        </nav>
      }
    </DeadCenter>
    )
};

const SpectateList = () => (
  <Page content={<Content />} />
);

export default SpectateList;