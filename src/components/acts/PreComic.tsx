import React from 'react';

interface PreComicProps {
  actNum: number;
}

const PreComic: React.FC<PreComicProps> = ({ actNum }) => {
  return (
    <div className="act-container" style={{ justifyContent: 'center' }}>
      <h1 className="act-title">ini pre comic act {actNum}</h1>
    </div>
  );
};

export default PreComic;
