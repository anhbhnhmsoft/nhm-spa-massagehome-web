"use client";
import React from "react";
import { useProfile } from "@/features/user/hooks";
import {
  FeatureList,
  OrderBoardProfile,
  RegisterPartnerOrAffiliate,
  UserProfileCard,
} from "@/components/profile-tab";

const ProfileScreen = () => {
  const { user, dashboardData, refreshProfile, isLoading } = useProfile();

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* --- HEADER PROFILE --- */}
      {/* Giữ UserProfileCard full width nhưng nội dung bên trong nó nên được căn giữa 1024px */}
      <UserProfileCard
        user={user}
        dashboardData={dashboardData}
        refreshProfile={refreshProfile}
      />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        <OrderBoardProfile dashboardData={dashboardData} />

        <RegisterPartnerOrAffiliate />

        <FeatureList />
      </main>
    </div>
  );
};

export default ProfileScreen;
