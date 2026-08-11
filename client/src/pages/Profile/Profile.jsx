import { useEffect, useState } from "react";
import { getProfile } from "../../services/profileService";

import ProfileHeader from "../../pages/Profile/ProfileHeader";
import PersonalInfoCard from "../../pages/Profile/PersonalInfoCard";
import EducationCard from "../../pages/Profile/EducationCard";
import ProfessionalCard from "../../pages/Profile/ProfessionalCard";
import AIProfileCard from "../../pages/Profile/AIProfileCard";
import PlacementCard from "../../pages/Profile/PlacementCard";
import SocialLinksCard from "../../pages/Profile/SocialLinksCard";
import ProgressCard from "../../pages/Profile/ProgressCard";
import "../../components/ProtectedLayout/ProtectedLayout.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();

      console.log("Profile:", response.data);

      setProfile(response.data.data);
    } catch (error) {
      console.error("Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading Profile...</div>;
  }

  if (!profile) {
    return <div>Unable to load profile.</div>;
  }

  return (
    <div className="profile-page">
      <ProfileHeader profile={profile} />

      <PersonalInfoCard profile={profile} />

      <EducationCard profile={profile} />

      <ProfessionalCard profile={profile} />

      <AIProfileCard profile={profile} />

      <PlacementCard profile={profile} />

      <SocialLinksCard profile={profile} />

      <ProgressCard profile={profile} />
    </div>
  );
}

export default Profile;
