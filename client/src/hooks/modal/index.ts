import { create } from "zustand";

type ModalType = "DELETE" | "VERIFY" | "";

type ModalState = {
    isOpen: boolean;
    type: ModalType;
    title: string;
    onSubmit: () => void;
    openModal: (payload: { type: ModalType; title: string; onSubmit: () => void }) => void;
    closeModal: () => void;
};

const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    type: "",
    title: "",
    onSubmit: () => {},
    openModal: ({type, title, onSubmit}) =>
        set({
            isOpen: true,
            type,
            title,
            onSubmit,
        }),
    closeModal: () =>
        set({
            isOpen: false,
            type: "",
            title: "",
            onSubmit: () => {},
        }),
}));

export default useModalStore;
