import GameLayout from "@/components/GameLayout";
import ProfileView from "./ProfileView";

export const metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <GameLayout>
      <ProfileView />
    </GameLayout>
  );
}
