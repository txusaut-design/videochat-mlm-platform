// src/components/video/CreateRoomModal.tsx
'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useVideoRoom } from '@/hooks/useVideoRoom';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  topic: z.string().max(200, 'Topic too long').optional(),
  isPrivate: z.boolean(),
  password: z.string().optional(),
}).refine((data) => {
  if (data.isPrivate && (!data.password || data.password.length < 4)) {
    return false;
  }
  return true;
}, {
  message: "Private rooms require a password of at least 4 characters",
  path: ["password"],
});

type CreateRoomFormData = z.infer<typeof createRoomSchema>;

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRoomModal: FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createRoom } = useVideoRoom();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      isPrivate: false,
    },
  });

  const isPrivate = watch('isPrivate');

  const onSubmit = async (data: CreateRoomFormData) => {
    try {
      setIsLoading(true);
      createRoom(data);
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Card>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Create Room</h2>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Room Name"
                  placeholder="Enter room name"
                  {...register('name')}
                  error={errors.name?.message}
                />

                <div>
                  <label className="label">Description (Optional)</label>
                  <textarea
                    {...register('description')}
                    placeholder="Describe what this room is about..."
                    rows={3}
                    className="input resize-none"
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <Input
                  label="Topic (Optional)"
                  placeholder="e.g., Gaming, Business, Social"
                  {...register('topic')}
                  error={errors.topic?.message}
                />

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('isPrivate')}
                    className="rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500"
                  />
                  <label className="text-slate-300 text-sm">
                    Make this room private (requires password)
                  </label>
                </div>

                {isPrivate && (
                  <div className="relative">
                    <Input
                      label="Room Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter room password"
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}

                <div className="flex space-x-3 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    className="flex-1"
                  >
                    Create Room
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateRoomModal;