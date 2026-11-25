import { Video } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MeetingLinkActions from "@/components/meetings/meeting-link-actions";

type Props = {
  /** Skip Zoom auto-create and use a pasted link. */
  useOwnLink: boolean;
  onUseOwnLinkChange: (value: boolean) => void;
  link: string;
  onLinkChange: (value: string) => void;
  error?: string;
  /** When editing: the link already saved on the meeting. */
  existingLink?: string;
  /** When editing: the host start URL already saved on the meeting. */
  existingStartUrl?: string;
  /** When editing: whether the saved link was created by Zoom. */
  existingIsZoom?: boolean;
  compact?: boolean;
};

/**
 * Link area for an online meeting. Default is an auto-generated Zoom link
 * (no input); staff can opt into pasting their own link instead.
 */
export default function MeetingLinkSection({
  useOwnLink,
  onUseOwnLinkChange,
  link,
  onLinkChange,
  error,
  existingLink,
  existingStartUrl,
  existingIsZoom,
  compact = false,
}: Props) {
  const hasExisting = Boolean(existingLink?.trim());
  // The API can't switch a saved manual link back to Zoom ("" doesn't clear).
  const canToggle = !(hasExisting && !existingIsZoom);

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      {!useOwnLink ? (
        <div className="flex items-start gap-3">
          <Video className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div className="min-w-0 space-y-1 text-sm">
            <p className="font-medium text-gray-900">Zoom meeting</p>
            {hasExisting && existingIsZoom ? (
              <>
                <p className="text-gray-600">
                  The join link stays the same when you reschedule.
                </p>
                <MeetingLinkActions
                  meetingLink={existingLink}
                  zoomStartUrl={existingStartUrl}
                  showLink
                  className="pt-1"
                />
              </>
            ) : (
              <p className="text-gray-600">
                A Zoom link is created automatically when you save
                {compact ? "." : " and shared with the customer."}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {canToggle ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <Checkbox
            checked={useOwnLink}
            onCheckedChange={(checked) => onUseOwnLinkChange(checked === true)}
          />
          Use my own link instead
        </label>
      ) : null}

      {useOwnLink ? (
        <div className="space-y-2">
          <Label htmlFor="meeting-link">
            Meeting Link <span className="text-red-500">*</span>
          </Label>
          <Input
            id="meeting-link"
            placeholder="https://meet.google.com/xyz-abcd-efg"
            value={link}
            aria-invalid={Boolean(error)}
            onChange={(e) => onLinkChange(e.target.value)}
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
