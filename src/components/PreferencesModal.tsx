import React, { useState } from 'react';
import { Modal, Button, Card, Nav } from 'react-bootstrap';

interface PreferencesModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (easyPronunciations: string[], difficultPronunciations: string[]) => void;
  initialEasyPronunciations: string[];
  initialDifficultPronunciations: string[];
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  show,
  onHide,
  onSave,
  initialEasyPronunciations,
  initialDifficultPronunciations
}) => {
  const [easyPronunciations, setEasyPronunciations] = useState<string[]>(initialEasyPronunciations);
  const [difficultPronunciations, setDifficultPronunciations] = useState<string[]>(initialDifficultPronunciations);
  const [activeTab, setActiveTab] = useState<'seion' | 'dakuon' | 'handakuon'>('seion');

  // 50音図のデータ（縦書き用に再構成、重複を除去）
  const seion = [
    ['わ', 'ら', 'や', 'ま', 'は', 'な', 'た', 'さ', 'か', 'あ'],
    ['', 'り', '', 'み', 'ひ', 'に', 'ち', 'し', 'き', 'い'],
    ['', 'る', 'ゆ', 'む', 'ふ', 'ぬ', 'つ', 'す', 'く', 'う'],
    ['', 'れ', '', 'め', 'へ', 'ね', 'て', 'せ', 'け', 'え'],
    ['を', 'ろ', 'よ', 'も', 'ほ', 'の', 'と', 'そ', 'こ', 'お'],
    ['ん']
  ];

  const dakuon = [
    ['ば', 'だ', 'ざ', 'が'],
    ['び', 'ぢ', 'じ', 'ぎ'],
    ['ぶ', 'づ', 'ず', 'ぐ'],
    ['べ', 'で', 'ぜ', 'げ'],
    ['ぼ', 'ど', 'ぞ', 'ご']
  ];

  const handakuon = [
    ['ぱ'],
    ['ぴ'],
    ['ぷ'],
    ['ぺ'],
    ['ぽ']
  ];

  const togglePronunciation = (sound: string, type: 'easy' | 'difficult') => {
    if (type === 'easy') {
      if (easyPronunciations.includes(sound)) {
        setEasyPronunciations(prev => prev.filter(s => s !== sound));
      } else {
        setEasyPronunciations(prev => [...prev, sound]);
        setDifficultPronunciations(prev => prev.filter(s => s !== sound));
      }
    } else {
      if (difficultPronunciations.includes(sound)) {
        setDifficultPronunciations(prev => prev.filter(s => s !== sound));
      } else {
        setDifficultPronunciations(prev => [...prev, sound]);
        setEasyPronunciations(prev => prev.filter(s => s !== sound));
      }
    }
  };

  const handleSave = () => {
    onSave(easyPronunciations, difficultPronunciations);
    onHide();
  };

  const renderSoundGrid = (sounds: string[][]) => (
    <div className="d-flex justify-content-center" style={{ gap: '1rem' }}>
      {sounds[0].map((_, columnIndex) => (
        <div key={columnIndex} className="d-flex flex-column" style={{ gap: '1rem' }}>
          {sounds.map((row, rowIndex) => (
            row[columnIndex] && row[columnIndex] !== '' && (
              <Button
                key={`${rowIndex}-${columnIndex}`}
                variant={
                  easyPronunciations.includes(row[columnIndex]) ? 'success' :
                    difficultPronunciations.includes(row[columnIndex]) ? 'danger' :
                      'light'
                }
                style={{
                  width: '48px',
                  height: '48px',
                  fontSize: '1.2rem',
                  padding: '0',
                  margin: '0'
                }}
                onClick={() => {
                  if (easyPronunciations.includes(row[columnIndex])) {
                    togglePronunciation(row[columnIndex], 'difficult');
                  } else if (difficultPronunciations.includes(row[columnIndex])) {
                    togglePronunciation(row[columnIndex], 'easy');
                  } else {
                    togglePronunciation(row[columnIndex], 'easy');
                  }
                }}
              >
                {row[columnIndex]}
              </Button>
            )
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>発音設定</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Nav
          variant="tabs"
          className="mb-4 justify-content-center"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k as 'seion' | 'dakuon' | 'handakuon')}
        >
          <Nav.Item>
            <Nav.Link eventKey="seion">清音</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="dakuon">濁音</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="handakuon">半濁音</Nav.Link>
          </Nav.Item>
        </Nav>

        <Card className="mb-4">
          <Card.Body>
            {activeTab === 'seion' && renderSoundGrid(seion)}
            {activeTab === 'dakuon' && renderSoundGrid(dakuon)}
            {activeTab === 'handakuon' && renderSoundGrid(handakuon)}
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-center gap-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-success" style={{ width: '20px', height: '20px', borderRadius: '4px' }}></div>
            <span>いいやすい音</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="bg-danger" style={{ width: '20px', height: '20px', borderRadius: '4px' }}></div>
            <span>苦手な音</span>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={handleSave}>
          保存
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreferencesModal;