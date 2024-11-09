import { useState } from 'react';
import './App.css';
import Row from './model/row';

function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [noi, setNoi] = useState<number>(0);
  const [voi, setVoi] = useState<number>(0);
  const [noiOld, setNoiOld] = useState<number>(0);
  const [voiOld, setVoiOld] = useState<number>(0);

  const handleNoiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNoi(parseInt(event.target.value) || 0);
  };

  const handleVoiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoi(parseInt(event.target.value) || 0);
  };

  const handleAddRow = () => {
    const noiNew = noi + noiOld;
    const voiNew = voi + voiOld;

    const newRow: Row = { row_id: rows.length + 1, noi: noiNew, voi: voiNew };

    setRows([...rows, newRow]);
    setNoiOld(noiNew);
    setVoiOld(voiNew);
    setNoi(0);
    setVoi(0);
  };

  return (
    <div className="body">
      <div className="buttons">
        <button onClick={handleAddRow}>Add</button>
        <input
          type="text"
          name="Noi"
          id="noi"
          placeholder="Noi"
          value={noi}
          onChange={handleNoiChange}
        />
        <input
          type="text"
          name="Voi"
          id="voi"
          placeholder="Voi"
          value={voi}
          onChange={handleVoiChange}
        />
      </div>
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Noi</th>
              <th>Voi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.row_id}>
                <td>{row.noi}</td>
                <td>{row.voi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
