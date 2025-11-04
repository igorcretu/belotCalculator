import { useState, useEffect } from 'react';
import './App.css';
import Row from './model/row';
import { FaCog, FaHistory, FaTimes } from 'react-icons/fa';

interface GameHistory {
  id: string;
  date: string;
  noiHeader: string;
  voiHeader: string;
  thirdHeader?: string;
  rows: Row[];
  finalScores: {
    noi: number;
    voi: number;
    third?: number;
  };
}

function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [noi, setNoi] = useState<string>("");
  const [voi, setVoi] = useState<string>("");
  const [third, setThird] = useState<string>("");
  const [noiOld, setNoiOld] = useState<string>("");
  const [voiOld, setVoiOld] = useState<string>("");
  const [thirdOld, setThirdOld] = useState<string>("");
  const [noiHeader, setNoiHeader] = useState<string>("Noi");
  const [voiHeader, setVoiHeader] = useState<string>("Voi");
  const [thirdHeader, setThirdHeader] = useState<string>("Third");
  const [showThirdColumn, setShowThirdColumn] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('belotCurrentGame');
    if (savedState) {
      const state = JSON.parse(savedState);
      setRows(state.rows || []);
      setNoi(state.noi || "");
      setVoi(state.voi || "");
      setThird(state.third || "");
      setNoiOld(state.noiOld || "");
      setVoiOld(state.voiOld || "");
      setThirdOld(state.thirdOld || "");
      setNoiHeader(state.noiHeader || "Noi");
      setVoiHeader(state.voiHeader || "Voi");
      setThirdHeader(state.thirdHeader || "Third");
      setShowThirdColumn(state.showThirdColumn || false);
    }

    const savedHistory = localStorage.getItem('belotGameHistory');
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      rows,
      noi,
      voi,
      third,
      noiOld,
      voiOld,
      thirdOld,
      noiHeader,
      voiHeader,
      thirdHeader,
      showThirdColumn
    };
    localStorage.setItem('belotCurrentGame', JSON.stringify(state));
  }, [rows, noi, voi, third, noiOld, voiOld, thirdOld, noiHeader, voiHeader, thirdHeader, showThirdColumn]);

  const handleNoiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNoi(event.target.value);
  };

  const handleVoiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoi(event.target.value);
  };

  const handleThirdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThird(event.target.value);
  };

  const handleNoiHeaderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNoiHeader(event.target.value);
  };

  const handleVoiHeaderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoiHeader(event.target.value);
  };

  const handleThirdHeaderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThirdHeader(event.target.value);
  };

  const handleAddRow = () => {
    const noiNew = (parseInt(noi) || 0) + (parseInt(noiOld) || 0);
    const voiNew = (parseInt(voi) || 0) + (parseInt(voiOld) || 0);
    const thirdNew = (parseInt(third) || 0) + (parseInt(thirdOld) || 0);

    const newRow: Row = { row_id: rows.length + 1, noi: noiNew, voi: voiNew, thirdColumng: thirdNew };

    setRows([...rows, newRow]);
    setNoiOld(noiNew.toString());
    setVoiOld(voiNew.toString());
    setThirdOld(thirdNew.toString());
    setNoi("");
    setVoi("");
    setThird("");
  };

  const handleReset = () => {
    setRows([]);
    setNoiOld("");
    setVoiOld("");
    setThirdOld("");
    setNoi("");
    setVoi("");
    setThird("");
  };

  const handleSaveToHistory = () => {
    if (rows.length === 0) {
      alert("No game to save!");
      return;
    }

    const lastRow = rows[rows.length - 1];
    const newGame: GameHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      noiHeader,
      voiHeader,
      thirdHeader: showThirdColumn ? thirdHeader : undefined,
      rows: [...rows],
      finalScores: {
        noi: lastRow.noi,
        voi: lastRow.voi,
        third: showThirdColumn ? lastRow.thirdColumng : undefined
      }
    };

    const updatedHistory = [newGame, ...gameHistory];
    setGameHistory(updatedHistory);
    localStorage.setItem('belotGameHistory', JSON.stringify(updatedHistory));

    handleReset();
    alert("Game saved to history!");
  };

  const handleDeleteFromHistory = (id: string) => {
    const updatedHistory = gameHistory.filter(game => game.id !== id);
    setGameHistory(updatedHistory);
    localStorage.setItem('belotGameHistory', JSON.stringify(updatedHistory));
  };

  const handleToggleThirdColumn = () => {
    setShowThirdColumn(!showThirdColumn);
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const handleHistoryToggle = () => {
    setShowHistory(!showHistory);
  };

  // Calculate turn indicator based on player names
  const getTurnIndicator = (rowIndex: number): string => {
    const noiNames = noiHeader.includes(',')
      ? noiHeader.split(',').map(n => n.trim())
      : [noiHeader];
    const voiNames = voiHeader.includes(',')
      ? voiHeader.split(',').map(n => n.trim())
      : [voiHeader];

    // Build turn sequence: P1Name1, P2Name1, P1Name2, P2Name2
    const turnSequence: string[] = [];
    const maxNames = Math.max(noiNames.length, voiNames.length);

    for (let i = 0; i < maxNames; i++) {
      if (noiNames[i]) {
        turnSequence.push(noiNames[i].charAt(0).toUpperCase());
      }
      if (voiNames[i]) {
        turnSequence.push(voiNames[i].charAt(0).toUpperCase());
      }
    }

    // Return the turn indicator for this row
    return turnSequence[rowIndex % turnSequence.length] || "";
  };

  return (
    <div className='container'>
      <div className="body">
        <div className="top-buttons">
          <button onClick={handleHistoryToggle} className='history-btn'>
            <FaHistory /> History
          </button>
          <button onClick={handleSettingsToggle} className='settings-btn'>
            <FaCog /> Settings
          </button>
        </div>
        <div className="buttons">
          <button onClick={handleAddRow} className='add'>Add</button>
          <input
            type="number"
            name="Noi"
            id="noi"
            placeholder={noiHeader}
            value={noi}
            onChange={handleNoiChange}
          />
          <input
            type="number"
            name="Voi"
            id="voi"
            placeholder={voiHeader}
            value={voi}
            onChange={handleVoiChange}
          />
          {showThirdColumn && (
            <input
              type="number"
              name="Third"
              id="third"
              placeholder={thirdHeader}
              value={third}
              onChange={handleThirdChange}
            />
          )}
        </div>
        <div className="action-buttons">
          <button onClick={handleSaveToHistory} className='save'>Save Game</button>
          <button onClick={handleReset} className='reset'>Reset</button>
        </div>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th className="turn-column">Turn</th>
                <th>{noiHeader}</th>
                <th>{voiHeader}</th>
                {showThirdColumn && <th>{thirdHeader}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.row_id}>
                  <td className="turn-column">{getTurnIndicator(index)}</td>
                  <td>{row.noi}</td>
                  <td>{row.voi}</td>
                  {showThirdColumn && <td>{row.thirdColumng}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showSettings && (
        <div className="modal-overlay" onClick={handleSettingsToggle}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings</h2>
              <button onClick={handleSettingsToggle} className='close-icon'>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <label>
                Player 1 Name(s):
                <input
                  type="text"
                  name="NoiHeader"
                  id="noiHeader"
                  placeholder="e.g., Dana, Igor"
                  value={noiHeader}
                  onChange={handleNoiHeaderChange}
                />
              </label>
              <label>
                Player 2 Name(s):
                <input
                  type="text"
                  name="VoiHeader"
                  id="voiHeader"
                  placeholder="e.g., Pavel, Elena"
                  value={voiHeader}
                  onChange={handleVoiHeaderChange}
                />
              </label>
              {showThirdColumn && (
                <label>
                  Player 3 Name(s):
                  <input
                    type="text"
                    name="ThirdHeader"
                    id="thirdHeader"
                    placeholder="Third Player"
                    value={thirdHeader}
                    onChange={handleThirdHeaderChange}
                  />
                </label>
              )}
              <button onClick={handleToggleThirdColumn} className='toggle'>
                {showThirdColumn ? 'Hide' : 'Show'} Third Column
              </button>
            </div>
          </div>
        </div>
      )}
      {showHistory && (
        <div className="modal-overlay" onClick={handleHistoryToggle}>
          <div className="modal history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Game History</h2>
              <button onClick={handleHistoryToggle} className='close-icon'>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              {gameHistory.length === 0 ? (
                <p className="no-history">No games saved yet.</p>
              ) : (
                <div className="history-list">
                  {gameHistory.map((game) => (
                    <div key={game.id} className="history-item">
                      <div className="history-header">
                        <div className="history-date">{game.date}</div>
                        <button
                          onClick={() => handleDeleteFromHistory(game.id)}
                          className="delete-btn"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <div className="history-players">
                        <strong>{game.noiHeader}</strong> vs <strong>{game.voiHeader}</strong>
                        {game.thirdHeader && <> vs <strong>{game.thirdHeader}</strong></>}
                      </div>
                      <div className="history-scores">
                        <span>{game.noiHeader}: {game.finalScores.noi}</span>
                        <span>{game.voiHeader}: {game.finalScores.voi}</span>
                        {game.finalScores.third !== undefined && (
                          <span>{game.thirdHeader}: {game.finalScores.third}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
