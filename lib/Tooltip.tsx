import React from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactElement;
    position?: 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
    const positionClass = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
    return (
        <div className="relative group flex items-center">
            {children}
            <div className={`absolute ${positionClass} left-1/2 -translate-x-1/2 w-max max-w-xs bg-neutral-800 text-white text-xs font-semibold rounded-md py-1 px-2.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none z-50`}>
                {text}
            </div>
        </div>
    );
};

export default Tooltip;
