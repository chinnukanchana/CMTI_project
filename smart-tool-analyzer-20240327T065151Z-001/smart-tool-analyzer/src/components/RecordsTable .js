import React from 'react';

const RecordsTable = ({ savedFiles }) => {
  return (
    <div>
      <h2>Saved Records</h2>
      <table>
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            {/* Add more table headers as needed */}
          </tr>
        </thead>
        <tbody>
          {savedFiles.map((record, index) => (
            <tr key={index}>
              <td>{record.column1}</td>
              <td>{record.column2}</td>
              {/* Add more table cells for each column in your record */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;
