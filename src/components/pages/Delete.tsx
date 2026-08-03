import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { type SimpleResponse } from "@/lib/objects";
import { Trash2 } from "lucide-react";

type DeleteProps<T extends string | number> = {
  id: T;
  description: string;
  name: string;
  isDeleting: boolean;
  mutateAsync: (request: { id: T }) => Promise<SimpleResponse>;
};

export function Delete<T extends string | number>({
  id,
  description,
  name,
  isDeleting,
  mutateAsync,
}: DeleteProps<T>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:ring hover:ring-red-500"
          />
        }
      >
        <Trash2 className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-fit rounded-lg border border-red-500 bg-neutral-950">
        <AlertDialogHeader>
          <AlertDialogTitle>
            How <span className="font-medium text-emerald-500/50">high</span>{" "}
            are you?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}{" "}
            <span className="font-medium text-red-500">{name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-md bg-neutral-950 text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:ring hover:ring-red-500"
            onClick={() => mutateAsync({ id })}
            disabled={isDeleting}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
