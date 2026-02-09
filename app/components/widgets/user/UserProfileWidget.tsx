'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { WidgetKind } from '@/lib/types/workspace';
import { Button } from '@/components/ui/primitives/Button';
import { Tabs } from '@/components/ui/primitives/Tabs';

import styles from './UserProfileWidget.module.scss';

const UserProfileWidget: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { openWindow } = useWorkspaceStore();

    const handleReLogin = () => {
        openWindow({
            title: 'Login',
            content: { kind: WidgetKind.Auth, sourceId: 'auth' },
            initialGeometry: { width: 320, height: 400, x: 'center', y: 'center' }
        });
    };

    if (isAuthenticated) {
        // [Mock Data] 為了滿足視覺驗收要求，我們模擬一些會員資料
        // 在 Phase 8 Option A (OS Auth) 模式下，這些資料暫時無法從 Shopify 獲取
        const mockOrders = [
            { id: '#SH-1024', date: '2024-01-15', total: 'NT$ 3,280', status: 'Fulfilled' },
            { id: '#SH-1025', date: '2024-02-02', total: 'NT$ 1,500', status: 'Processing' }
        ];

        return (
            <div className={`${styles.profileContainer} w-full h-full flex flex-col p-4 justify-between text-sm select-none`}>
                {/* Header / Profile Card */}
                <div className="border-1 border-gray-600">
                    <div className="flex items-center gap-4 m-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 bg-gray-200 border border-gray-400 flex items-center justify-center overflow-hidden rounded-full shadow-md">
                            <img
                                src="/assets/classicy/img/icons/system/users/user.png"
                                alt="Avatar"
                                className="w-10 h-10 opacity-80"
                                onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100?text=U'}
                            />
                        </div>
                        {/* Name & Badge */}
                        <div>
                            {/* <div className="font-bold text-lg text-gray-900 leading-tight">
                                {user?.email?.split('@')[0] || 'Member'}
                            </div> */}
                            {/* <div className="text-blue-700 font-bold text-[10px] uppercase tracking-wider bg-blue-50 inline-block px-1 rounded border border-blue-100 mt-1">
                                OS Insider • Gold
                            </div> */}
                            <div className="text-black text-[12px] mt-1 tracking-tighter">
                                ID: {user?.email || 'unknown'}
                            </div>
                        </div>
                    </div>

                    {/* Stats / Level Grid */}
                    {/* <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-gray-50 border border-gray-200 p-2 rounded shadow-sm">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Level</div>
                            <div className="font-bold text-sm text-gray-800">Gold VIP</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-2 rounded shadow-sm">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Points</div>
                            <div className="font-bold text-sm text-gray-800">1,313</div>
                        </div>
                    </div> */}
                </div>

                <Tabs defaultValue="shipping" className="flex-1 flex flex-col min-h-0 mb-4">
                    <Tabs.List className="mb-[-1px] z-10 px-0 pl-1">
                        <Tabs.Trigger value="shipping">Shipping</Tabs.Trigger>
                        <Tabs.Trigger value="returns">Returns</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Panel value="shipping" className="p-0 bg-transparent border-0 shadow-none">
                        <h2 className="font-bold mb-2">Shipping:</h2>
                        <p>Most of the time orders are fulfilled next day, tracking will be provided via email. Contact us via 1313heart.cool4u@gmail.com.</p>
                    </Tabs.Panel>
                    <Tabs.Panel value="returns" className="p-0 bg-transparent border-0 shadow-none">
                        <h2 className="font-bold mb-2">Returns:</h2>
                        <p>Refunds will only be issued if an item is incorrectly listed. It is the buyers' responsibility to refer to sizing and measurements to ensure items will fit.</p>
                    </Tabs.Panel>

                </Tabs>

                {/* Orders Section */}
                {/* <div className="flex-1 bg-white border-2 border-gray-600 shadow-inset p-3 mb-4 overflow-y-auto custom-scrollbar">
                    <h4 className="font-bold text-[10px] mb-3 text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-1">
                        Recent Activity
                    </h4>
                    {mockOrders.length > 0 ? (
                        <div className="space-y-2">
                            {mockOrders.map(order => (
                                <div key={order.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 hover:bg-blue-50 transition-colors cursor-default">
                                    <div>
                                        <span className="font-bold block text-xs text-gray-800">{order.id}</span>
                                        <span className="text-[10px] text-gray-500">{order.date}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-mono text-xs text-gray-900">{order.total}</span>
                                        <span className={`text-[10px] px-1 rounded ${order.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div className="text-center text-[10px] text-gray-400 mt-3 italic">
                                * Displaying cached history
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-8 text-xs">No recent orders found.</div>
                    )}
                </div> */}

                {/* Footer Actions */}
                <div className="flex justify-end items-center pt-2">
                    {/* <div className="text-[10px] text-gray-500">v2.1.0-stable</div> */}
                    <Button onClick={() => { logout(); window.location.reload(); }} variant="default">
                        Sign Out
                    </Button>
                </div>
            </div>
        );
    }

    // Fallback for unauthenticated
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#c0c0c0]">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4 border-2 border-gray-400">
                <span className="text-2xl text-gray-500">?</span>
            </div>
            <div className="text-red-600 font-bold mb-2 text-lg">Access Restricted</div>
            <p className="text-xs text-gray-600 mb-6 max-w-[180px] leading-relaxed">
                Please verify your identity to access the member system.
            </p>
            <Button onClick={handleReLogin} isDefault={true}>
                Login / Register
            </Button>
        </div>
    );
};

// [Critical Fix] 必須使用 default export 才能被 React.lazy 正確載入
export default UserProfileWidget;