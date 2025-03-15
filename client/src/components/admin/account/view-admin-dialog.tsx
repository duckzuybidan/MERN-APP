import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
type DialogField = {
    isOpen: boolean
}
export default function ViewAdminDialog({
    dialog,
    setDialog,
    adminEmails
}: {
    dialog: DialogField,
    setDialog: React.Dispatch<React.SetStateAction<DialogField>>
    adminEmails: string[]
}) {
  return (
    <Dialog open={dialog.isOpen} onOpenChange={() => setDialog((prev) => ({...prev, isOpen: !prev.isOpen}))}>
      <DialogContent className="bg-white overflow-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>View Admins</DialogTitle>
          <DialogDescription>View all admins</DialogDescription>
        </DialogHeader>
        <Separator className="w-full bg-slate-300"/>
        <div className="flex flex-col gap-3">
          {adminEmails.map((email, index) => (
            <div key={index} className="bg-slate-100 p-2 rounded-md">
              <p>{email}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
