import { Match, MatchState } from "../../types/Match";

interface Props {
  currentMatch: Match;
}

const ChoosingTeamsView: React.FC<Props> = ({ currentMatch }) => {
  function onStartMatch(): void {
    currentMatch.state = MatchState.MatchStarted
  }

  // ... your component logic ...

  return (
    <div>
      {/* ... your component UI ... */}
      <button onClick={onStartMatch}>Next</button>
    </div>
  );
};

export default ChoosingTeamsView;
