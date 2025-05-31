// src/Contact.jsx
import { useState } from 'react';
import { toast } from 'react-toastify';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, message } = formData;

        if (!name || !email || !message) {
            setError('All fields are required');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error);
                return;
            }

            toast.success("Message sent successfully!", { position: "top-right", autoClose: 5000 });
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setError('Error: ' + error.message);
        }
    };

    return (
        <section className="md:flex justify-between gap-8 mt-7 p-5 max-w-5xl mx-auto bg-gray-100 rounded-lg shadow-lg" id="contact">
            <div className="flex-1 p-5 text-4xl">
                <h2 className="text-2xl text-gray-800 pb-8">Contact Us</h2>
                <p className="text-lg text-gray-600 pb-2">ሀሣብ አስተያየት ካሎት እባክዎትን ከዚህ ያስቀምጡ 👉</p>
                <a href="#map" className="text-xl text-gray-800 no-underline pb-2">View on Map</a>
                <p className="text-lg text-gray-600 pb-2">Phone: 011000000</p>
                <p className="text-lg text-gray-600">Email: HibrtsegaH@gmail.com</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-5">
                <div className="mb-5">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mt-6">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        placeholder="Enter Message"
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded resize-y min-h-[100px] max-h-[300px]"
                        required
                    />
                </div>
                <div className="mt-6">
                    <button name="submit" type="submit" className="bg-yellow-400 text-white py-3 px-5 rounded hover:bg-yellow-300">Submit</button>
                </div>
                {error && <div className="text-red-500 mt-4">{error}</div>}
            </form>
        </section>
    );
};

export default Contact;
