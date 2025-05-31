import { useEffect, useState } from 'react';

const slides = [
    '../Assites/back1.png',
    '../Assites/back2.png',
    '../Assites/back3.png',
    '../Assites/back1.png',
];

const Slider = () => {
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

    useEffect(() => {
        const interval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, [currentSlide]);

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
                {/* Use the new Query Component here */}
               
            </section>

            <section className="text-center py-12">
                <h1 className="text-3xl font-bold mb-4">WELCOME TO FETH AI LEGAL ADVICE AND LAWYER FINDER SYSTEM</h1>
            </section>
        </>
    );
};

export default Slider;
