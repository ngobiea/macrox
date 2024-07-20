import { useState } from 'react';

function App(): JSX.Element {
  const [recordedActions, setRecordedActions] = useState<Action[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  window.api.onUpdateActions((actions: Action[]) => {
    setRecordedActions(actions);
  });
  const toggleRecordButton = (): void => {
    if (isRecording) {
      setIsRecording(false);
      window.api.recordAction(false);
    } else {
      window.api.recordAction(true);
      setIsRecording(true);
    }
  };

  return (
    <>
      <div className="record-container">
        <button id="toggle-record-button" onClick={toggleRecordButton}>
          {isRecording ? 'Stop Recording (Ctrl + R)' : 'Start Recording (Ctrl+R)'}
        </button>
        <table id="actions-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>X</th>
              <th>Y</th>
              <th>Key</th>
              <th>State</th>
              <th>Delay</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="actions-body">
            {recordedActions.map((action) => (
              <tr key={action.id}>
                <td>{action.type}</td>
                <td>{action.x}</td>
                <td>{action.y}</td>
                <td>{action.state}</td>
                <td>{action.key}</td>
                <td>{action.delay}</td>
                <td>
                  <button
                    className="delete-button"
                    data-id={action.id}
                    onClick={() => window.api.deleteAction(action.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h1>Assign Key to Macro</h1>
      <div className="bind-container">
        <input id="key-input" type="text" placeholder="Enter key to bind macro" />
        <button id="bind-key-button">Bind Key</button>
        <button id="play-button">Play</button>
      </div>
    </>
  );
}

export default App;
