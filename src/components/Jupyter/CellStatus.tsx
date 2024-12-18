import React from 'react';
import { Loader, Check, AlertCircle } from 'react-feather';
import { CellStatus as StatusType } from '../../types/notebook';

interface CellStatusProps {
  status: StatusType;
}

const CellStatus: React.FC<CellStatusProps> = ({ status }) => {
  switch (status) {
    case 'running':
      return (
        <div className="animate-spin text-blue-400">
          <Loader size={14} />
        </div>
      );
    case 'success':
      return <Check size={14} className="text-green-400" />;
    case 'error':
      return <AlertCircle size={14} className="text-red-400" />;
    default:
      return null;
  }
};

export default CellStatus; 