import React from 'react';
import { useParams } from 'react-router-dom';
import { MaterialNormsTab } from '@/components/materials/MaterialNormsTab';

const Norms: React.FC = () => {
  const { id: projectId } = useParams();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Định mức Vật tư</h1>
            <p className="page-subtitle">Quản lý định mức tiêu hao vật tư theo công việc</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <MaterialNormsTab />
      </div>
    </div>
  );
};

export default Norms;
