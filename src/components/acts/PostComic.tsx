import React from 'react';

interface PostComicProps {
  actNum: number;
}

const PostComic: React.FC<PostComicProps> = ({ actNum }) => {
  return (
    <div className="act-container" style={{ justifyContent: 'center' }}>
      <h1 className="act-title">ini post comic act {actNum}</h1>
    </div>
  );
};

export default PostComic;
