interface Props {
  onEndMatch: () => void;
}

const MatchStartedView: React.FC<Props> = ({ onEndMatch }) => {
  // ... your component logic ...

  return (
    <div>
      {/* ... your component UI ... */}``
      <button onClick={onEndMatch}>Next</button>
    </div>
  );
};

export default MatchStartedView;
