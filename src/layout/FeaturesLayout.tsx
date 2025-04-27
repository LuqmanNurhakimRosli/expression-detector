import { Outlet } from 'react-router-dom';

function FeaturesLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}

export default FeaturesLayout;
