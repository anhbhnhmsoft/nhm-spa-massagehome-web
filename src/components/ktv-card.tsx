

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Briefcase, User, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {ListKTVItem} from "@/features/user/types"; // Hoặc thư viện i18n bạn đang dùng



export const KTVHomePageCard = ({ item }: { item: ListKTVItem }) => {
    const { t } = useTranslation();
    const [imageError, setImageError] = useState(false);

    // Giả định hook setKtv của bạn xử lý logic chọn KTV
    // const setKtv = useSetKtv();

    const handlePress = () => {
        console.log("Selected KTV ID:", item.id);
        // setKtv(item.id);
    };

    return (
        <button
            onClick={handlePress}
            className="group relative flex w-full flex-col rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >
            {/* --- AVATAR --- */}
            <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-slate-100 sm:aspect-video lg:aspect-square">
                {item.profile?.avatar_url && !imageError ? (
                    <Image
                        src={item.profile.avatar_url}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={() => setImageError(true)}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200">
                        <User size={24} className="text-slate-400" />
                    </div>
                )}

                {/* Icon Verified */}
                <div className="absolute right-1 top-1 rounded-full bg-blue-500 p-0.5 shadow-sm">
                    <CheckCircle size={10} className="text-white" />
                </div>
            </div>

            {/* --- INFO --- */}
            <div className="flex flex-col items-center w-full">
                <h3 className="w-full truncate text-center font-bold text-sm text-slate-800">
                    {item.name}
                </h3>

                {/* Rating */}
                <div className="mb-2 mt-1 flex items-center justify-center space-x-1">
                    <Star size={10} className="fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-[10px] text-slate-700">
            {item.rating || 0}
          </span>
                    <span className="text-[10px] text-slate-400">
            ({item.review_count || 0})
          </span>
                </div>

                {/* Services Count */}
                <div className="flex w-full items-center justify-center gap-1 rounded bg-blue-50 px-1 py-1.5 transition-colors group-hover:bg-blue-100">
                    <Briefcase size={10} className="text-blue-600" />
                    <span className="truncate font-medium text-[10px] text-blue-600">
            {item.service_count} {t('common.service')}
          </span>
                </div>
            </div>
        </button>
    );
};