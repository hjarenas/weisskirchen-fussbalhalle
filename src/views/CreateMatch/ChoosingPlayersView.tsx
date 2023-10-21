import { Match, MatchState } from "../../types/Match";

interface Props {
  currentMatch: Match;
}

const ChoosingPlayersView: React.FC<Props> = ({ currentMatch }) => {
  function onNext(): void {
    currentMatch.state = MatchState.PreparingMatch;
  }

  // ... your component logic ...

  return (
    <div>
      {/* ... your component UI ... */}
      <button onClick={onNext}>Next</button>
    </div>
  );
};

export default ChoosingPlayersView;
