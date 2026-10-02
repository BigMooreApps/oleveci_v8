import React from 'react';
import { Post } from '../types';
import { PostDetailCard } from './PostDetailCard';

export interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
  onSelectBusiness?: (businessId: string) => void;
  isBusinessSection?: boolean;
  onEditPost?: (post: Post) => void;
  fromBusinessProfile?: boolean;
  onSelectPost?: (post: Post) => void;
  onBackToProfile?: (businessId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onSelectBusiness,
  isBusinessSection,
  onEditPost,
  fromBusinessProfile = false,
  onSelectPost,
  onBackToProfile,
}) => {
  if (!post) return null;

  return (
    <div
      id="post-detail-modal"
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        <PostDetailCard
          post={post}
          onClose={onClose}
          onSelectBusiness={onSelectBusiness}
          isBusinessSection={isBusinessSection}
          onEditPost={onEditPost}
          fromBusinessProfile={fromBusinessProfile}
          onSelectPost={onSelectPost}
          onBackToProfile={onBackToProfile}
          showCloseButton={true}
        />
      </div>
    </div>
  );
};
