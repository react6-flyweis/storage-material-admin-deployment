import { useNavigate } from "react-router";
import { useLogoutMutation } from "@/modules/auth/auth.hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import type { PropsWithChildren } from "react";

type UserMenuProps = PropsWithChildren & { onOpenProfile?: () => void };

export function UserMenu({ children, onOpenProfile }: UserMenuProps) {
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogoutMutation();
  const goProfile = () => navigate("/profile");
  const goSettings = () => navigate("/settings");
  const signOut = () => {
    // Call logout mutation then navigate to sign-in
    void (async () => {
      try {
        await logout();
      } catch (e) {
        // ignore error and still navigate to sign-in
      } finally {
        navigate("/sign-in");
      }
    })();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50">
        <DropdownMenuItem
          onClick={() => (onOpenProfile ? onOpenProfile() : goProfile())}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-left focus:bg-gray-50 focus:text-gray-700"
        >
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600 font-light">My profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={goSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-left focus:bg-gray-50 focus:text-gray-700"
        >
          <Settings className="w-5 h-5 text-gray-500" />
          <span className="text-[#3E4857] font-light">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />

        <DropdownMenuItem
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors text-left font-medium focus:bg-red-50 focus:text-red-500"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;

