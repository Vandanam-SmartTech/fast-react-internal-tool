import React from 'react';

interface ConsumerNumberInputProps {
  consumerNumber: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isMsebConnection: string;
}

const ConsumerNumberInput: React.FC<ConsumerNumberInputProps> = ({
  consumerNumber,
  handleChange,
  isMsebConnection,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Consumer Number
      </label>  
      <input
        type="text"
        name="consumerNumber"
        value={consumerNumber}
        maxLength={12}
        onChange={handleChange}
        placeholder="CN001"
        disabled={isMsebConnection === 'No'}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
};

export default ConsumerNumberInput;
