'use client';

import type { User } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCardUrl } from '@/lib/utils';

interface CardPreviewProps {
  user: User & { links?: { id: string; platform: string; title: string; url: string }[] };
  links?: { id: string; platform: string; title: string; url: string }[];
}

export function CardPreview({ user, links = [] }: CardPreviewProps) {
  const displayLinks = user.links ?? links;
  const themeColor = user.theme_color || '#6366f1';

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Live preview</h3>
      <div
        className="rounded-2xl border bg-card p-6 shadow-lg"
        style={{ maxWidth: 360 }}
      >
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 border-4 border-background shadow-md" style={{ borderColor: themeColor }}>
            <AvatarImage src={user.profile_image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-2xl" style={{ backgroundColor: themeColor, color: '#fff' }}>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
          {user.bio && <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>}
          <div className="mt-4 flex w-full flex-col gap-2">
            {displayLinks.slice(0, 5).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-xl py-2.5 text-sm font-medium text-white transition opacity-90 hover:opacity-100"
                style={{ backgroundColor: themeColor }}
              >
                {link.title}
              </a>
            ))}
            {displayLinks.length > 5 && (
              <span className="text-xs text-muted-foreground">+{displayLinks.length - 5} more</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Share: {getCardUrl(user.username)}
      </p>
    </div>
  );
}
