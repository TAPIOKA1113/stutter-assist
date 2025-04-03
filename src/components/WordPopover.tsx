import React, { forwardRef, Ref, MouseEvent, useState, useEffect } from 'react';
import { getSmartAlternatives } from '../services/apiService';

interface WordPopoverProps {
  word: string;
  position: {
    top: number;
    left: number;
  };
  currentText: string; // 現在のエディタのテキスト全体
  onSelect: (alternative: string) => void;
  onIgnore: () => void;
  onMouseEnter?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLDivElement>) => void;
}

interface Alternative {
  word: string;
  score: number;
  original_score: number;
  pronunciation_difficulty: number;
}

const WordPopover = forwardRef((
  { word, position, currentText, onSelect, onIgnore, onMouseEnter, onMouseLeave }: WordPopoverProps,
  ref: Ref<HTMLDivElement>
) => {
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ホバー状態の管理
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 代替案をAPIから取得
  useEffect(() => {
    const fetchAlternatives = async () => {
      try {
        setLoading(true);
        // スマート代替案APIを呼び出し
        const result = await getSmartAlternatives(currentText, word);

        if (result && result.alternatives && Array.isArray(result.alternatives)) {
          // 代替案の配列を設定
          setAlternatives(result.alternatives);
        } else {
          // フォールバック：空の配列
          setAlternatives([]);
        }
      } catch (err) {
        console.error('代替案の取得に失敗しました', err);
        setError('代替案を取得できませんでした');
        // エラー時には基本的な代替案を表示
        setAlternatives(['代替案1', '代替案2', '代替案3']);
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [word, currentText]);

  const handleSelect = (alternative: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    onSelect(alternative);
  };

  const handleIgnore = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onSelect('ignore');
    onIgnore();
  };

  const style = {
    position: 'absolute' as const,
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: '150px',
    transform: 'translateX(0)',
  };

  // stopPropagationを追加して、ポップオーバー内のクリックがドキュメント全体に伝播しないようにする
  const handlePopoverClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      className="word-popover"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handlePopoverClick}
    >
      {loading ? (
        <div className="loading-text" style={{ padding: '10px', textAlign: 'center' }}>読み込み中...</div>
      ) : error ? (
        <div className="error-text" style={{ padding: '10px', textAlign: 'center', color: 'red' }}>{error}</div>
      ) : alternatives.length === 0 ? (
        <div className="no-alternatives" style={{ padding: '10px', textAlign: 'center' }}>代替案がありません</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {alternatives.map((alt, index) => (
            <li
              key={index}
              onClick={(e) => handleSelect(alt, e)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: hoveredIndex === index ? '#f0f0f0' : 'transparent'
              }}
            >
              {alt}
            </li>
          ))}
          <li
            id="ignore_item"
            onClick={(e) => handleIgnore(e)}
            onMouseEnter={() => setHoveredIndex(-1)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderTop: '1px solid #eee',
              color: '#999',
              backgroundColor: hoveredIndex === -1 ? '#f0f0f0' : 'transparent'
            }}
          >
            無視
          </li>
        </ul>
      )}
    </div>
  );
});

export default WordPopover; 