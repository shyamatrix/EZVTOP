
import MarksDisplay from "./marksDislay";

export default function MarksSubTab({ data, moodleData, handleFetchMoodle, setMoodleData, IDs, attendance }) {
    return (
        <MarksDisplay data={data} attendance={attendance} />
    );
}