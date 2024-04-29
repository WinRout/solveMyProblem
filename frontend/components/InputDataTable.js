import React from 'react';

const InputDataTable = ({ data }) => {
  if (!data) {
    return <p>Loading data...</p>;
  }

  return (
    <div className='glassmorphism'>
        <table className="w-full text-sm text-left rtl:text-right">
        <tbody>
            {Object.entries(data).map(([key, value], index) => (
            <tr key={index}>
                <th scope="row" className="px-6 py-4 font-medium">
                {key}
                </th>
                <td className="px-6 py-4">
                {value}
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  );
};

export default InputDataTable;
