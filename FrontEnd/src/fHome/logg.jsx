import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sfooter from '../public/Sfooter';
import axios from "axios";
import { toast } from 'react-toastify';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => { 
        e.preventDefault();
        try {
            const result = await axios.post('http://localhost:5000/api/login', { email, password });
            if (result.data === "success") {
                toast.success("Logged in successfully!", {
                    position: "top-right",
                    autoClose: 5000,
                });
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <>
            <div className="p-5 bg-gray-300 h-96">
                <div className="bg-black md:mx-96 max-sm:my-32 max-sm:p-10 rounded-3xl shadow-lg max-w-md w-full p-8 md:p-10">
                    <h1 className="text-white text-2xl mb-2">Admin Sign In</h1>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <span className="text-gray-400 mb-4">Use your email and password</span>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-gray-800 text-white border-none rounded-lg p-3 mb-4 w-full"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-gray-800 text-white border-none rounded-lg p-3 mb-4 w-full"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? (
                                    <i className="fas fa-eye"></i>
                                ) : (
                                    <i className="fas fa-eye-slash"></i>
                                )}
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="bg-yellow-500 text-black font-semibold py-2 px-6 rounded-lg uppercase tracking-wider">
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
            <Sfooter />
        </>
    );
};

export default Login;
