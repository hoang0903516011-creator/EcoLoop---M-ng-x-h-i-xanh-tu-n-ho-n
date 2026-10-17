import React, { useState } from 'react';
import { EcoScannerView } from '../components/Scanner/EcoScannerView';
import { EcoBotChatModal } from '../components/Chat/EcoBotChatModal';
import { storage } from '../services/storageService';
import { ScanResult } from '../types';

interface EcoBotModuleProps {
  onNavigateToMapWithFilter?: (category: string) => void;
  onNavigateToSocial?: () => void;
}

export const EcoBotModule: React.FC<EcoBotModuleProps> = ({
  onNavigateToMapWithFilter,
  onNavigateToSocial,
}) => {
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>(undefined);
  const [scanContext, setScanContext] = useState<any>(null);

  const handleShareToFeed = (result: ScanResult, imageSrc: string) => {
    const summaryText = result.items
      .map((item) => `• ${item.label} (${item.categoryName})`)
      .join('\n');

    storage.createPost({
      content: `♻️ Mình vừa phân loại rác thải thành công:\n${summaryText}\n${result.overview}`,
      postType: 'Chia sẻ sống xanh',
      images: [imageSrc],
      materialType: result.items.map((i) => i.categoryName).join(', '),
    });

    if (onNavigateToSocial) {
      onNavigateToSocial();
    }
  };

  const handleNavigateToChat = (initialMessage?: string, context?: any) => {
    setInitialChatMessage(initialMessage);
    setScanContext(context);
    setChatModalOpen(true);
  };

  const handleAddEcoPoints = (points: number) => {
    storage.addEcoPoints(
      points,
      'Phân loại rác bằng EcoBot AI',
      'Nhận diện vật thể chính xác và phân loại rác bảo vệ môi trường'
    );
  };

  return (
    <div className="pb-16 max-w-5xl mx-auto space-y-6">
      <EcoScannerView
        onShareToFeed={handleShareToFeed}
        onNavigateToChat={handleNavigateToChat}
        onAddEcoPoints={handleAddEcoPoints}
      />

      {/* EcoBot Chat Assistant Modal */}
      <EcoBotChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        initialMessage={initialChatMessage}
        scanContext={scanContext}
      />
    </div>
  );
};
