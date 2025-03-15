import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import useModalStore from "@/hooks/modal"

export default function VerifyModal() {
    const { isOpen, type, title, onSubmit, closeModal } = useModalStore();
    const isModalOpen = isOpen && type === "VERIFY"
    return (
        <Dialog open={isModalOpen} onOpenChange={(() => closeModal())}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button 
                        className="bg-black text-white" 
                        onClick={onSubmit}
                    >
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
