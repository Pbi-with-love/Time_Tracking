import React, { useEffect, useState } from 'react';
import { CircleCheck, X, CircleX } from 'lucide-react';

const Alert = ({ onClose, message, type }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fadeInTimer = setTimeout(() => setVisible(true), 10);
        const fadeOutTimer = setTimeout(() => setVisible(false), 2500); 
        const closeTimer = setTimeout(onClose, 3500);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(closeTimer);
        };
    }, [message, type, onClose]);

    return (
        <div
            className={`fixed p-4 bg-white shadow-md z-2000 top-4 right-4 border-l-5 rounded-sm w-[300px]
            transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}
            ${type === 'success' ? 'border-green-400' : 'border-red-400'}`}
        >
            <div className="flex items-start gap-3">
                {type === 'success' ? (
                    <CircleCheck className="text-green-400 w-6 h-6 flex-shrink-0" />
                ) : (
                    <CircleX className="text-red-400 w-6 h-6 flex-shrink-0" />
                )}
                <div className="flex flex-col gap-1">
                    <p className="text-black text-base">{message}</p>
                </div>
                <X
                    onClick={() => onClose()}
                    className="text-neutral-400 cursor-pointer ml-auto w-5 h-5 flex-shrink-0"
                />
            </div>
        </div>
    );
};

export default Alert;
