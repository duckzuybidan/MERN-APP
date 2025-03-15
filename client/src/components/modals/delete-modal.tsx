import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useState } from "react"
import useModalStore from "@/hooks/modal"

export default function DeleteModal() {
    const { isOpen, type, title, onSubmit, closeModal } = useModalStore();
    const isModalOpen = isOpen && type === "DELETE"
    const [inputText, setInputText] = useState("")
    return (
        <Dialog open={isModalOpen} onOpenChange={(() => closeModal())}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Delete {title}</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <p>Type <span className="font-bold">{title}</span> to confirm</p>
                <Input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <DialogFooter>
                    <Button 
                        className="bg-red-500 hover:bg-red-300 disabled:bg-red-300" 
                        onClick={onSubmit}
                        disabled={inputText !== title}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
