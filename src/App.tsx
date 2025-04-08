import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import NavBar from './components/NavBar';
import Editor from './components/Editor';
// import PreferencesModal from './components/PreferencesModal';
import PreferencesModal2 from './components/PreferencesModal2';
import { checkApiStatus } from './services/apiService';

function App() {

  // モーダル表示状態の管理
  const [showPreferences, setShowPreferences] = useState<boolean>(false);

  // APIの状態管理
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  // 設定値の管理
  const [easyWords, setEasyWords] = useState<string[]>([]);
  const [difficultWords, setDifficultWords] = useState<string[]>([]);

  // 容易な音，苦手な音の設定
  const [easyPronunciations, setEasyPronunciations] = useState<string[]>([]);
  const [difficultPronunciations, setDifficultPronunciations] = useState<string[]>([]);

  // APIの接続状態を確認する
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkApiStatus();
        setApiConnected(status && status.status === 'ok');
      } catch (error) {
        console.error('API接続エラー:', error);
        setApiConnected(false);
      }
    };

    checkConnection();
    // 30秒ごとに接続状態を確認
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);


  // 簡単な単語をリストに追加
  const handleAddEasyWord = (word: string) => {
    if (!easyWords.includes(word)) {
      setEasyWords([...easyWords, word]);
    }
  };

  // 難しい単語をリストに追加
  const handleAddDifficultWord = (word: string) => {
    if (!difficultWords.includes(word)) {
      setDifficultWords([...difficultWords, word]);
    }
  };

  return (
    <div className="App">
      <NavBar
        onPreferencesClick={() => setShowPreferences(true)}
        apiConnected={apiConnected}
      />
      <Container fluid>
        <Row className="my-4">
          <Col md={8}>
            <Editor
              hardWords={difficultWords}
              onAddEasyWord={handleAddEasyWord}
              onAddDifficultWord={handleAddDifficultWord}
              userEasyWords={easyWords}
              userDifficultWords={difficultWords}
              easyPronunciations={easyPronunciations}
              difficultPronunciations={difficultPronunciations}
            />
          </Col>
        </Row>
      </Container>

      {/* 設定モーダル */}
      <PreferencesModal2
        show={showPreferences}
        onHide={() => setShowPreferences(false)}
        onSave={(easyPronunciations, difficultPronunciations) => {
          setEasyPronunciations(easyPronunciations);
          setDifficultPronunciations(difficultPronunciations);
          setShowPreferences(false);
        }}
        initialEasyPronunciations={easyPronunciations}
        initialDifficultPronunciations={difficultPronunciations}
      />

    </div>
  );
}

export default App; 