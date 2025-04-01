import React, { forwardRef, Ref, MouseEvent } from 'react';

interface WordPopoverProps {
  word: string;
  position: {
    top: number;
    left: number;
  };
  onSelect: (alternative: string) => void;
  onIgnore: () => void;
  onMouseEnter?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLDivElement>) => void;
}

interface AlternativesDict {
  [key: string]: string[];
}

const WordPopover = forwardRef((
  { word, position, onSelect, onIgnore, onMouseEnter, onMouseLeave }: WordPopoverProps,
  ref: Ref<HTMLDivElement>
) => {
  // 単語の代替案（実際のアプリではAPIから取得）
  const mockAlternatives: AlternativesDict = {
    // 英語の単語
    'stuttering': ['どもり', '言葉の詰まり', '吃音', '発話障害'],
    'presentation': ['発表', '説明', '講演', 'スピーチ'],
    'professional': ['専門的', '職業的', '熟練した', '上級'],
    'country': ['国', '国家', '地域', '領土', '土地'],
    'organization': ['組織', '団体', '機関', '協会', '連合'],

    // 日本語の単語
    '吃音症': ['言葉の詰まり', 'どもり', '発話障害', '発語障害'],
    '職業的': ['仕事の', '専門的', '業務上の', '職務的'],
    '言語障害': ['話し方の問題', '発語障害', '発話困難', '会話障害'],
    '戦略': ['手法', '方法', '対策', '手段', 'やり方'],
    '置き換え': ['交換', '代替', '入れ替え', '差し替え']
  };

  // 選択された単語の代替案を取得
  const alternatives = mockAlternatives[word.toLowerCase()] || ['代替案1', '代替案2', '代替案3'];

  const handleSelect = (alternative: string): void => {
    onSelect(alternative);
  };

  const handleIgnore = (): void => {
    onSelect('ignore');
    onIgnore();
  };

  const style = {
    position: 'absolute' as const,
    top: `${position.top}px`,
    left: `${position.left}px`,
  };

  return (
    <div
      ref={ref}
      className="word-popover"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ul>
        {alternatives.map((alt, index) => (
          <li key={index} onClick={() => handleSelect(alt)}>
            {alt}
          </li>
        ))}
        <li id="ignore_item" onClick={handleIgnore}>
          無視
        </li>
      </ul>
    </div>
  );
});

export default WordPopover; 