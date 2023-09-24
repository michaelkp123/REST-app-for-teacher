import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";

export default function Modal({ open = true, link, children, size = "xl" }) {
  let [isOpen, setIsOpen] = useState(open);
  const navigate = useNavigate();
  const location = useLocation();

  function closeModal() {
    setIsOpen(false);
    setTimeout(() => {
      navigate(
        link ??
          location.pathname.substring(0, location.pathname.lastIndexOf("/")),
        { replace: true }
      );
    }, 200);
  }

  let maxWidth = size;
  if (maxWidth == "xs") {
    maxWidth = "max-w-xs";
  } else if (maxWidth == "sm") {
    maxWidth = "max-w-sm";
  } else if (maxWidth == "md") {
    maxWidth = "max-w-md";
  } else if (maxWidth == "lg") {
    maxWidth = "max-w-lg";
  } else if (maxWidth == "xl") {
    maxWidth = "max-w-xl";
  } else if (maxWidth == "2xl") {
    maxWidth = "max-w-2xl";
  } else if (maxWidth == "3xl") {
    maxWidth = "max-w-3xl";
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`${maxWidth} relative w-full transform overflow-hidden rounded-2xl bg-white py-9 px-6 text-left align-middle shadow-xl transition-all`}
              >
                <IoClose
                  className="absolute top-4 right-4 cursor-pointer"
                  size={26}
                  onClick={closeModal}
                />
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
