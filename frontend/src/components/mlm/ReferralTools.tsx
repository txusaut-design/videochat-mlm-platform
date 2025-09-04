// src/components/mlm/ReferralTools.tsx
'use client';

import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LinkIcon,
  QrCodeIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import QRCode from 'react-qr-code';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';

import { mlmApi } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ReferralToolsProps {
  className?: string;
}

const ReferralTools: FC<ReferralToolsProps> = ({ className = '' }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { data: referralData } = useQuery(
    'referral-link',
    mlmApi.getReferralLink
  );

  const handleCopyLink = () => {
    setCopiedLink(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareViaEmail = () => {
    if (!referralData) return;
    
    const subject = encodeURIComponent('Join VideoChat MLM - Premium Video Chat Platform');
    const body = encodeURIComponent(
      `Hi!\n\nI'd like to invite you to join VideoChat MLM, a premium video chat platform with earning opportunities.\n\nUse my referral link: ${referralData.referralLink}\n\nOr use referral code: ${referralData.referralCode}\n\nBest regards!`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    if (!referralData) return;

    const text = encodeURIComponent(
      `Join me on VideoChat MLM! Premium video chat with crypto earnings. Use my referral code: ${referralData.referralCode}`
    );
    const url = encodeURIComponent(referralData.referralLink);

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (!referralData) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <LinkIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading referral tools...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Referral Link & Code */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Referral Tools</h3>
            <p className="text-sm text-slate-400">Share your link and start earning</p>
          </div>
          
          <Button
            variant="ghost"
            size="small"
            onClick={() => setShowQR(!showQR)}
          >
            <QrCodeIcon className="w-4 h-4 mr-2" />
            QR Code
          </Button>
        </div>

        <div className="space-y-4">
          {/* Referral Link */}
          <div>
            <label className="label">Your Referral Link</label>
            <div className="flex space-x-2">
              <Input
                value={referralData.referralLink}
                readOnly
                className="flex-1"
              />
              <CopyToClipboard
                text={referralData.referralLink}
                onCopy={handleCopyLink}
              >
                <Button variant="primary" className="px-3">
                  {copiedLink ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                </Button>
              </CopyToClipboard>
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="label">Your Referral Code</label>
            <div className="flex space-x-2">
              <Input
                value={referralData.referralCode}
                readOnly
                className="flex-1"
              />
              <CopyToClipboard
                text={referralData.referralCode}
                onCopy={handleCopyCode}
              >
                <Button variant="secondary" className="px-3">
                  {copiedCode ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                </Button>
              </CopyToClipboard>
            </div>
          </div>

          {/* QR Code */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-lg flex justify-center"
            >
              <QRCode value={referralData.referralLink} size={200} />
            </motion.div>
          )}
        </div>
      </Card>

      {/* Share Options */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-6">Share Your Link</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="ghost"
            onClick={shareViaEmail}
            className="flex flex-col items-center p-4 h-auto"
          >
            <EnvelopeIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Email</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => shareViaSocial('twitter')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Twitter</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => shareViaSocial('facebook')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <ShareIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">Facebook</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => shareViaSocial('linkedin')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <LinkIcon className="w-6 h-6 mb-2" />
            <span className="text-sm">LinkedIn</span>
          </Button>
        </div>
      </Card>

      {/* Tips & Best Practices */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Sharing Tips</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <div className="text-white font-medium">Personal Touch</div>
              <div className="text-slate-400">Add a personal message when sharing your link</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <div className="text-white font-medium">Target Audience</div>
              <div className="text-slate-400">Share with people interested in video chat and earning opportunities</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <div className="text-white font-medium">Follow Up</div>
              <div className="text-slate-400">Check in with your referrals to help them get started</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReferralTools;