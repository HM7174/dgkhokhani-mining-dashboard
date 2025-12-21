import React from 'react';

const SubscriptionItem = ({ label, value, color }) => (
    <div className={`p-4 rounded-xl ${color} flex items-center justify-between group cursor-pointer transition-transform hover:scale-[1.02]`}>
        <span className="text-sm font-bold text-slate-800">{label}</span>
        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-slate-800 shadow-sm transition-shadow group-hover:shadow-md">{value}</span>
    </div>
);

const SubscriptionDetails = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Subscription Details</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View more</button>
            </div>
            <div className="space-y-4">
                <SubscriptionItem
                    label="Lite Plan"
                    value="0"
                    color="bg-rose-100/50"
                />
                <SubscriptionItem
                    label="Prime Plan"
                    value="5"
                    color="bg-amber-100/50"
                />
            </div>
        </div>
    );
};

export default SubscriptionDetails;
