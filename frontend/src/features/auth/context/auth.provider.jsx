import { useState, useEffect } from "react";
import { AuthContext } from "./auth.context";
import { getMe } from "../services/auth.api";

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    //Check if user is already logged in & store them in state
    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                setUser(data?.user ?? null);
            } catch (err) {
                // 401 is expected if the user isn't logged in yet, so don't log it as an error
                if (err.response?.status !== 401) {
                    console.error("Error fetching user data:", err);
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getAndSetUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};