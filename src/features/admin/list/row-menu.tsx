"use client";

import { Copy, ExternalLink, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog, DropdownMenu, MenuItem, MenuLink, MenuSeparator } from "@/components/admin-ui/overlay";
import { toast } from "@/components/admin-ui/toast";
import { deleteItem, duplicateItem, setPublished } from "../actions";

type Props = { resourceKey: string; id: string; title: string; editHref: string; publicHref?: string | null; published: boolean; canDuplicate: boolean };

/** "⋯" actions for a list row: edit, view, publish/unpublish, duplicate, delete. */
export function RowMenu({ resourceKey, id, title, editHref, publicHref, published, canDuplicate }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [, start] = useTransition();

  const togglePublish = () =>
    start(async () => {
      const r = await setPublished(resourceKey, id, !published);
      if (r.ok) toast.success(published ? "Moved to drafts" : "Published", title);
      else toast.error("Could not update", r.error);
      router.refresh();
    });

  const duplicate = () =>
    start(async () => {
      try {
        const r = await duplicateItem(resourceKey, id);
        if (r && !r.ok) toast.error("Could not duplicate", r.error);
      } catch (e) {
        if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
        toast.error("Could not duplicate", (e as Error).message);
      }
    });

  return (
    <>
      <DropdownMenu label={`Actions for ${title}`} trigger={<MoreHorizontal aria-hidden="true" />}>
        <MenuLink href={editHref}>
          <Pencil aria-hidden="true" />
          Edit
        </MenuLink>
        {publicHref ? (
          <MenuLink href={publicHref} external>
            <ExternalLink aria-hidden="true" />
            View on site
          </MenuLink>
        ) : null}
        <MenuItem onClick={togglePublish}>
          {published ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {published ? "Unpublish" : "Publish"}
        </MenuItem>
        {canDuplicate ? (
          <MenuItem onClick={duplicate}>
            <Copy aria-hidden="true" />
            Duplicate
          </MenuItem>
        ) : null}
        <MenuSeparator />
        <MenuItem danger onClick={() => setConfirm(true)}>
          <Trash2 aria-hidden="true" />
          Delete
        </MenuItem>
      </DropdownMenu>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Delete “${title}”?`}
        description="It is removed from the site and the database. This cannot be undone. To hide it instead, unpublish it."
        onConfirm={async () => {
          const r = await deleteItem(resourceKey, id, false);
          if (!r.ok) throw new Error(r.error);
          toast.success("Deleted", title);
          router.refresh();
        }}
      />
    </>
  );
}
