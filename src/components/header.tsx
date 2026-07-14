import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import { NotificationMenu } from "@/components/notification-menu";
import steelLogo from "@/assets/steel-building-depot-logo.png";
import { UserMenu } from "@/components/user-menu";
import ProfileDialog from "@/components/profile-dialog";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="size-6" />
          </Button>

          {/* Search Bar */}
          <div className="hidden md:block relative w-48 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search leads, projects..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Right Side - Notifications and Logo */}
          <div className="flex items-center gap-3 md:gap-6">
            <NotificationMenu />

            <UserMenu onOpenProfile={() => setProfileOpen(true)}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="size-6" />
              </Button>
            </UserMenu>

            {/* The Steel Logo */}
            <div>
              <img src={steelLogo} alt="The Steel Logo" className="h-8 w-auto" />
            </div>
          </div>
        </div>
      </header>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}

