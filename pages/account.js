import { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import Layout from '../components/Layout/Layout';

export default function Account() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin((prev) => !prev);
    };

    return (
        <Layout>
            <div className="account-container">
                <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
                {isLogin ? <LoginForm toggleForm={toggleForm} /> : <SignupForm toggleForm={toggleForm} />}
            </div>
            <style jsx>{`
                .account-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: #f9f9f9;
                }
                h1 {
                    margin-bottom: 20px;
                }
            `}</style>
        </Layout>
    );
}