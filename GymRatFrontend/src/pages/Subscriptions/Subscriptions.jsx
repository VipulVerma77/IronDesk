import { useState } from 'react';

import PlansTab from './PlansTab';
import AssignTab from './AssignTab';
import AllSubscriptionsTab from './AllSubscriptionsTab';

import { tabs } from '../../constants/subscriptionConstants.js';

const Subscriptions = () => {
  const [activeTab, setActiveTab] = useState('plans');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-black text-[#2A1F1A]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Subscriptions
        </h1>

        <p className="text-sm text-[#6B6B6B] mt-1">
          Manage plans, assign subscriptions and track status
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#ECE4DC]/50 rounded-2xl p-1.5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-[#2A1F1A] shadow-sm'
                : 'text-[#6B6B6B] hover:text-[#2A1F1A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'plans' && <PlansTab />}
        {activeTab === 'assign' && <AssignTab />}
        {activeTab === 'all' && <AllSubscriptionsTab />}
      </div>
    </div>
  );
};

export default Subscriptions;