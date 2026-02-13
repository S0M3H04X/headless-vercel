'use client';
import React from 'react';
import { SystemService } from '@/lib/services/systemService';
import { getNodeById } from '@/lib/filesystem/data'; // [修正] 引入新函式
import { BaseWidgetProps, WidgetKind } from '@/lib/types/workspace';
import { useIconInteraction } from '@/hooks/useIconInteraction';
import { FileSystemNode } from '@/lib/filesystem/types';
import styles from './FolderWidget.module.scss';

export const FolderWidget: React.FC<BaseWidgetProps> = ({ id, content }) => {

    const nodeId = content.sourceId; // 這裡接收到的會是 'shop'

    // [修正] 使用 ID 查找節點
    const node = getNodeById(nodeId);
    const items = node?.children || [];

    // [重構後] 互動邏輯完全委派
    const handleOpenItem = (item: FileSystemNode) => {
        SystemService.openFile(item);
    };

    if (!node) {
        return (
            <div className="flex items-center justify-center h-full text-red-500 font-mono text-sm">
                Error: Path not found "{nodeId}"
            </div>
        );
    }

    return (
        <div className={styles.folderContainer}>
            {/* Status Bar / Info */}
            <div className="px-2 py-1 text-xs border-b border-gray-400 bg-gray-100 flex gap-2">
                <span>{items.length} items</span>
            </div>

            <div className={styles.gridContent}>
                {items.length === 0 ? (
                    <div className="w-full text-center text-gray-400 text-xs mt-4">(Empty)</div>
                ) : (
                    items.map(item => (
                        <FolderIconItem
                            key={item.id}
                            item={item}
                            onOpen={() => handleOpenItem(item)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Sub-component to handle interactions
interface FolderIconItemProps {
    item: FileSystemNode;
    onOpen: () => void;
}

const FolderIconItem = ({ item, onOpen }: FolderIconItemProps) => {
    const { onTouchStart, onTouchEnd, onClick } = useIconInteraction({
        onOpen,
        onSelect: () => console.log('Selected:', item.name),
    });

    return (
        <div
            className={styles.item}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={onClick}
            title={item.name}
        >
            <img src={item.icon || '/assets/classicy/img/icons/system/files/file.png'} alt={item.name} />
            <span>{item.name}</span>
        </div>
    );
};