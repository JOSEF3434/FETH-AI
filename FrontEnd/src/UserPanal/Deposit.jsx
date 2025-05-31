import { useState, useEffect } from 'react';
import axios from 'axios';
import UserSideBar from './UserSideBar';
import Nave from '../Pages/Nave';

const Deposit = () => {
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Retrieve user information from local storage
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        if (loggedUser) {
            setEmail(loggedUser.email); // Set email from logged-in user
            setUserName(loggedUser.name); // Set user name from logged-in user
        }
    }, []);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (amount <= 0) {
            setMessage('Deposit amount must be greater than zero');
            return;
        }
        try {
            const response = await axios.post('http://localhost:4000/api/customers/deposit', {
                userName,
                email,
                amount: parseFloat(amount)
            });
            // Check if the response contains balance
            if (response.data.balance !== undefined) {
                setMessage(`Deposit successful! New balance: ${response.data.balance} ETB`);
                setAmount('')
            } else {
                setMessage('Deposit successful, but balance could not be retrieved.');
            }

        } catch (error) {
            setMessage(error.response?.data?.error || 'An error occurred');
        }
    };
    

    return (
        <>
        <Nave />
        <div className='grid md:grid-cols-4'>
            <UserSideBar />
            <div className="max-w-md mx-auto m-10 px-20 p-5 border rounded shadow-lg col-span-3">
                <h2 className="text-2xl font-bold text-center mb-4">Deposit Currency</h2>
                <form onSubmit={handleDeposit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            readOnly // Make email read-only since it's fetched from local storage
                            className="mt-1 p-2 w-full border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Amount (ETB)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 p-2 w-full border rounded"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                        Deposit
                    </button>
                </form>
                {message && <p className="mt-4 text-center">{message}</p>}
            </div>
        </div></>
    );
};

export default Deposit;
