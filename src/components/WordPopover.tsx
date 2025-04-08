import React, { forwardRef, Ref, MouseEvent, useState, useEffect } from 'react';
import { getSmartAlternatives } from '../services/apiService';

interface WordPopoverProps {
  word: string;
  position: {
    top: number;
    left: number;
  };
  currentText: string; // 現在のエディタのテキスト全体
  textPosition: {  // 追加：テキスト内での単語の位置
    start: number;
    end: number;
  };
  onSelect: (alternative: string) => void;
  onIgnore: () => void;
  onMouseEnter?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLDivElement>) => void;
}

const WordPopover = forwardRef((
  { word, position, currentText, textPosition, onSelect, onIgnore, onMouseEnter, onMouseLeave }: WordPopoverProps,
  ref: Ref<HTMLDivElement>
) => {
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // コンテキストウィンドウを取得する関数
  const getContextWindow = (text: string, start: number, end: number, windowSize: number) => {
    const beforeStart = Math.max(0, start - windowSize);
    const afterEnd = Math.min(text.length, start + windowSize);

    const beforeContext = text.slice(beforeStart, start).trim();
    const afterContext = text.slice(end, afterEnd).trim();

    return { beforeContext, afterContext };
  };

  // 代替案をAPIから取得
  useEffect(() => {
    const fetchAlternatives = async () => {
      try {
        setLoading(true);

        // コンテキストウィンドウを取得
        const { beforeContext, afterContext } = getContextWindow(
          currentText,
          textPosition.start,
          textPosition.end,
          350  // 前後200文字ずつ取得
        );

        const contextText = beforeContext + word + afterContext;
        console.log('contextText', contextText);

        // 代替案APIを呼び出し（コンテキスト情報を含める）
        const result = await getSmartAlternatives(
          contextText,
          word,
        );

        if (result && result.alternatives && Array.isArray(result.alternatives)) {
          setAlternatives(result.alternatives);
        } else {
          setAlternatives([]);
        }
      } catch (err) {
        console.error('代替案の取得に失敗しました', err);
        setError('代替案を取得できませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [word, currentText, textPosition]);

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