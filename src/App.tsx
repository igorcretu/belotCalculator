import { useState } from 'react';
import './App.css';
import Row from './model/row';
import { FaCog } from 'react-icons/fa';

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

  const handleToggleThirdColumn = () => {
    setShowThirdColumn(!showThirdColumn);
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className='container'>
      <div className="body">
        <div className="buttons">
          <button onClick={handleAddRow} className='add'>Add</button>
          <input
            type="number"
            name="Noi"
            id="noi"
            placeholder="Noi"
            value={noi}
            onChange={handleNoiChange}
          />
          <input
            type="number"
            name="Voi"
            id="voi"
            placeholder="Voi"
            value={voi}
            onChange={handleVoiChange}
          />
          {showThirdColumn && (
            <input
              type="number"
              name="Third"
              id="third"
              placeholder="Third"
              value={third}
              onChange={handleThirdChange}
            />
          )}
          <button onClick={handleReset} className='reset'>Reset</button>
          <button onClick={handleSettingsToggle} className='settings'>
            <FaCog />
          </button>
        </div>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>{noiHeader}</th>
                <th>{voiHeader}</th>
                {showThirdColumn && <th>{thirdHeader}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.row_id}>
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
        <div className="settings-modal">
          <div className="settings-content">
            <h2>Settings</h2>
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
            <button onClick={handleToggleThirdColumn} className='toggle'>Toggle Third Column</button>
            <button onClick={handleSettingsToggle} className='close'>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
