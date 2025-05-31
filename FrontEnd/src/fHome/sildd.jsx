import { useState, useRef, useEffect } from 'react';

const slides = [
    '../Assites/back1.png',
    '../Assites/back2.png',
    '../Assites/back3.png',
    '../Assites/back1.png',
];

const Sslider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const showSlide = (index) => {
        if (index >= slides.length) {
            setCurrentSlide(0);
        } else if (index < 0) {
            setCurrentSlide(slides.length - 1);
        } else {
            setCurrentSlide(index);
        }
    };

    // Auto-slide every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, [currentSlide]);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside both the dropdown and the button
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <section className="relative w-full overflow-hidden">
                <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {slides.map((slide, index) => (
                        <img
                            key={index}
                            src={slide}
                            alt={`Image ${index + 1}`}
                            style={{ height: '96vh' }}
                            className="min-w-full h-96 object-cover"
                        />
                    ))}
                </div>
                <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded"
                    onClick={() => showSlide(currentSlide - 1)}
                >
                    ❮
                </button>
                <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded"
                    onClick={() => showSlide(currentSlide + 1)}
                >
                    ❯
                </button>
                <div className="h-44 absolute left-2/6 top-2/6 transform -translate-y-1 max-sm:h-44 bg-gray-500 bg-opacity-10 text-white p-2 rounded">
                    <h1 className="md:text-5xl justify-items-center text-sm font-bold leading-relaxed text-center">
                        <span className="block">WELCOME TO FETH AI</span>
                    </h1>

                    <div className="relative inline-block text-left">
                        <div>
                            <button
                                type="button"
                                ref={buttonRef} // Reference for outside click detection
                                className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 hover:bg-gray-50"
                                id="menu-button"
                                aria-expanded={isOpen}
                                aria-haspopup="true"
                                onClick={toggleDropdown}
                            >
                                Chosee Your Legal Class
                                <svg
                                    className={`-mr-1 h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        {isOpen && (
                            <div
                                className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="menu-button"
                                ref={dropdownRef} // Reference for outside click detection
                            >
                                <div className="py-1" role="none">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" id="menu-item-0">Edit</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" id="menu-item-1">Duplicate</a>
                                </div>
                                <div className="py-1" role="none">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" id="menu-item-2">Archive</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" id="menu-item-3">Move</a>
                                </div>
                                <div className="py-1" role="none">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" id="menu-item-4">Share</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" id="menu-item-5">Add to favorites</a>
                                </div>
                                <div className="py-1" role="none">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" id="menu-item-6">Delete</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="text-center py-12">
                <h1 className="text-3xl font-bold mb-4">WELCOME TO FETH AI LEGAL ADVICE AND LAWYER FINDER SYSTEM</h1>
            </section>
        </>
    );
};

export default Sslider;