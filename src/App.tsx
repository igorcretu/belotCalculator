import { useState, useEffect } from 'react';
import './App.css';
import Row, { Game } from './model/row';
import { FaCog, FaSave, FaHistory } from 'react-icons/fa';
import { IoMdAdd } from "react-icons/io";
function App() {
  // Game state
  const [rows, setRows] = useState<Row[]>(() => {
    const saved = localStorage.getItem('currentGame');
    return saved ? JSON.parse(saved).rows : [];
  });
  const [noi, setNoi] = useState<string>(() => {
    const saved = localStorage.getItem('currentInputs');
    return saved ? JSON.parse(saved).noi : "";
  });
  const [voi, setVoi] = useState<string>(() => {
    const saved = localStorage.getItem('currentInputs');
    return saved ? JSON.parse(saved).voi : "";
  });
  const [third, setThird] = useState<string>(() => {
    const saved = localStorage.getItem('currentInputs');
    return saved ? JSON.parse(saved).third : "";
  });
  const [noiOld, setNoiOld] = useState<string>(() => {
    const saved = localStorage.getItem('currentTotals');
    return saved ? JSON.parse(saved).noiOld : "";
  });
  const [voiOld, setVoiOld] = useState<string>(() => {
    const saved = localStorage.getItem('currentTotals');
    return saved ? JSON.parse(saved).voiOld : "";
  });
  const [thirdOld, setThirdOld] = useState<string>(() => {
    const saved = localStorage.getItem('currentTotals');
    return saved ? JSON.parse(saved).thirdOld : "";
  });

  // Headers and settings
  const [noiHeader, setNoiHeader] = useState<string>(() => {
    const saved = localStorage.getItem('headers');
    return saved ? JSON.parse(saved).noiHeader : "Noi";
  });
  const [voiHeader, setVoiHeader] = useState<string>(() => {
    const saved = localStorage.getItem('headers');
    return saved ? JSON.parse(saved).voiHeader : "Voi";
  });
  const [thirdHeader, setThirdHeader] = useState<string>(() => {
    const saved = localStorage.getItem('headers');
    return saved ? JSON.parse(saved).thirdHeader : "Third";
  });
  const [showThirdColumn, setShowThirdColumn] = useState<boolean>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved).showThirdColumn : false;
  });
  const [fontSize, setFontSize] = useState<string>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved).fontSize : 'normal';
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<Game[]>(() => {
    const saved = localStorage.getItem('gameHistory');
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    localStorage.setItem('currentGame', JSON.stringify({ rows }));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem('headers', JSON.stringify({ noiHeader, voiHeader, thirdHeader }));
  }, [noiHeader, voiHeader, thirdHeader]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({ showThirdColumn, fontSize }));
  }, [showThirdColumn, fontSize]);

  useEffect(() => {
    localStorage.setItem('currentInputs', JSON.stringify({ noi, voi, third }));
  }, [noi, voi, third]);

  useEffect(() => {
    localStorage.setItem('currentTotals', JSON.stringify({ noiOld, voiOld, thirdOld }));
  }, [noiOld, voiOld, thirdOld]);

  const handleFontSizeChange = (size: 'small' | 'normal' | 'large') => {
    setFontSize(size);
  };

  const handleResetAll = () => {
    const confirmReset = window.confirm('Are you sure you want to reset everything? This will clear all games and settings.');
    if (confirmReset) {
      setRows([]);
      setNoiOld("");
      setVoiOld("");
      setThirdOld("");
      setNoi("");
      setVoi("");
      setThird("");
      setGameHistory([]);
      setNoiHeader("Noi");
      setVoiHeader("Voi");
      setThirdHeader("Third");
      setShowThirdColumn(false);
      setFontSize('normal');
      localStorage.clear();
    }
  };

  const getNextTurn = () => {
    const players1 = noiHeader.includes(',') ? noiHeader.split(',').map(n => n.trim()) : [noiHeader];
    const players2 = voiHeader.includes(',') ? voiHeader.split(',').map(n => n.trim()) : [voiHeader];
    const players3 = showThirdColumn && thirdHeader.includes(',') ?
      thirdHeader.split(',').map(n => n.trim()) :
      (showThirdColumn ? [thirdHeader] : []);

    const allPlayers: string[] = [];
    for (let i = 0; i < Math.max(players1.length, players2.length, players3.length); i++) {
      if (players1[i]) allPlayers.push(players1[i]);
      if (players2[i]) allPlayers.push(players2[i]);
      if (players3[i]) allPlayers.push(players3[i]);
    }

    const currentTurnIndex = rows.length % allPlayers.length;
    const player = allPlayers[currentTurnIndex];
    return player ? player[0].toUpperCase() : '-';
  };

  const handleAddRow = () => {
    const noiNew = (parseInt(noi) || 0) + (parseInt(noiOld) || 0);
    const voiNew = (parseInt(voi) || 0) + (parseInt(voiOld) || 0);
    const thirdNew = (parseInt(third) || 0) + (parseInt(thirdOld) || 0);

    const newRow: Row = {
      row_id: rows.length + 1,
      noi: noiNew,
      voi: voiNew,
      noiOld: parseInt(noi) || 0,
      voiOld: parseInt(voi) || 0,
      thirdColumng: thirdNew,
      thirdColumnOld: parseInt(third) || 0,
      turn: getNextTurn()
    };

    setRows([...rows, newRow]);
    setNoiOld(noiNew.toString());
    setVoiOld(voiNew.toString());
    setThirdOld(thirdNew.toString());
    setNoi("");
    setVoi("");
    setThird("");
  };

  const handleReset = () => {
    if (rows.length > 0) {
      const currentGame: Game = {
        id: Date.now(),
        date: new Date().toISOString(),
        rows: [...rows],
        noiHeader,
        voiHeader,
        thirdHeader: showThirdColumn ? thirdHeader : undefined,
        showThirdColumn,
        totalNoi: parseInt(noiOld) || 0,
        totalVoi: parseInt(voiOld) || 0,
        totalThird: showThirdColumn ? (parseInt(thirdOld) || 0) : undefined
      };
      setGameHistory(prev => [...prev, currentGame]);
      localStorage.setItem('gameHistory', JSON.stringify([...gameHistory, currentGame]));
    }

    setRows([]);
    setNoiOld("");
    setVoiOld("");
    setThirdOld("");
    setNoi("");
    setVoi("");
    setThird("");
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

  const handleDeleteLastRow = () => {
    if (rows.length === 0) return;

    const newRows = rows.slice(0, -1);
    setRows(newRows);

    if (newRows.length > 0) {
      // Update totals to the previous row's totals
      const lastRow = newRows[newRows.length - 1];
      setNoiOld(lastRow.noi.toString());
      setVoiOld(lastRow.voi.toString());
      setThirdOld((lastRow.thirdColumng || 0).toString());
    } else {
      // No rows left, reset totals
      setNoiOld("");
      setVoiOld("");
      setThirdOld("");
    }
  };

  return (
    <div className={`container font-size-${fontSize}`}>
      <div className="body">
        <div className="header">
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <img className="logo" src={`${process.env.PUBLIC_URL}/belot-trans.png`} alt="Belot Calculator Logo" />
            <h1 style={{fontSize: '1.5rem', marginLeft: '-8px', color: '#242424'}}>elot Calculator</h1></div>
          <div className="actions">
            <button onClick={handleHistoryToggle} className='history-btn' title="History">
              <FaHistory />
            </button>
            <button onClick={handleSettingsToggle} className='settings' title="Settings">
              <FaCog />
            </button>
          </div>
        </div>
        <div className="buttons">
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
          <button onClick={handleAddRow} className='add' title="Add">
            <IoMdAdd />
          </button>
          {rows.length > 0 && (
            <button onClick={handleReset} className='reset'>
              <FaSave />
            </button>
          )}
        </div>
        <div className="tables-container">
          <div className="table current-game">
            <div className="table-header">
              <h2>Current Game</h2>
              {rows.length > 0 && (
                <div className="totals">
                  <span>{noiHeader}: {rows[rows.length - 1].noi}</span>
                  <span>{voiHeader}: {rows[rows.length - 1].voi}</span>
                  {showThirdColumn && <span>{thirdHeader}: {rows[rows.length - 1].thirdColumng}</span>}
                </div>
              )}
            </div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Turn</th>
                  <th>{noiHeader}</th>
                  <th>{voiHeader}</th>
                  {showThirdColumn && <th>{thirdHeader}</th>}
                  <th style={{ width: '30px' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const shouldHaveBorder = showThirdColumn
                    ? row.row_id % 3 === 0
                    : row.row_id % 4 === 0;
                  return (
                    <tr key={row.row_id} >
                      <td className='turn-column '>{row.turn} </td>
                      <td className={shouldHaveBorder ? 'border-row' : ''}>{row.noi} <span className="added-value">({(row.noiOld || 0) === 0 ? 'BT' : `${(row.noiOld || 0) >= 0 ? '+' : ''}${row.noiOld || 0}`})</span></td>
                      <td className={shouldHaveBorder ? 'border-row' : ''}>{row.voi} <span className="added-value">({(row.voiOld || 0) === 0 ? 'BT' : `${(row.voiOld || 0) >= 0 ? '+' : ''}${row.voiOld || 0}`})</span></td>
                      {showThirdColumn && <td className={shouldHaveBorder ? 'border-row' : ''}>{row.thirdColumng} <span className="added-value">({(row.thirdColumnOld || 0) === 0 ? 'BT' : `${(row.thirdColumnOld || 0) >= 0 ? '+' : ''}${row.thirdColumnOld || 0}`})</span></td>}
                      <td className={shouldHaveBorder ? 'border-row' : ''}>
                        <button
                          className="delete"
                          style={{ display: row.row_id === rows.length ? 'block' : 'none' }}
                          onClick={handleDeleteLastRow}
                          title="Delete last row"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h2>Settings</h2>
            <div className="settings-section">
              <h3>Player Names</h3>
              <input
                type="text"
                name="NoiHeader"
                id="noiHeader"
                placeholder="Noi Header"
                value={noiHeader}
                onChange={handleNoiHeaderChange}
              />
              <input
                type="text"
                name="VoiHeader"
                id="voiHeader"
                placeholder="Voi Header"
                value={voiHeader}
                onChange={handleVoiHeaderChange}
              />
              {showThirdColumn && (
                <input
                  type="text"
                  name="ThirdHeader"
                  id="thirdHeader"
                  placeholder="Third Header"
                  value={thirdHeader}
                  onChange={handleThirdHeaderChange}
                />
              )}
            </div>

            <div className="settings-section">
              <h3>Display Options</h3>
              <button
                onClick={handleToggleThirdColumn}
                className={`toggle ${showThirdColumn ? 'active' : ''}`}>
                {showThirdColumn ? 'Disable' : 'Enable'} Third Column
              </button>

              <div className="font-size-controls">
                <span>Font Size:</span>
                <div className="font-size-buttons">
                  <button
                    onClick={() => handleFontSizeChange('small')}
                    className={`font-size-btn ${fontSize === 'small' ? 'active' : ''}`}>
                    Small
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('normal')}
                    className={`font-size-btn ${fontSize === 'normal' ? 'active' : ''}`}>
                    Normal
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('large')}
                    className={`font-size-btn ${fontSize === 'large' ? 'active' : ''}`}>
                    Large
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-section danger-zone">

              <button onClick={handleResetAll} className='reset-all'>
                Reset Everything
              </button>
            </div>

            <button onClick={handleSettingsToggle} className='close'>Close</button>
          </div>
        </div>
      )}
      {showHistory && (
        <div className="history-modal">
          <div className="history-content">
            <h2>Game History</h2>
            {gameHistory.length > 0 ? (
              <div className="history-list">
                {gameHistory.map((game, index) => (
                  <div key={game.id} className="history-item">
                    <div className="history-date">
                      <span>{new Date(game.date).toLocaleDateString()}</span>
                      <span className="history-time">{new Date(game.date).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>
                    <div className="history-scores">
                      <span>{game.noiHeader}: {game.totalNoi}</span>
                      <span>{game.voiHeader}: {game.totalVoi}</span>
                      {game.showThirdColumn && (
                        <span>{game.thirdHeader}: {game.totalThird}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="history-empty">
                <p>No game history yet.</p>
              </div>
            )}
            <button onClick={handleHistoryToggle} className='close'>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
