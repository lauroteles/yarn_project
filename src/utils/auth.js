import { useAuthStore } from "../store/auth";
import axios from "./axios";
import jwt_decode from "jwt-decode";
import Cookie from 'js-cookie';
import Swal from 'sweetalert2';



export const login = async (email,password) => {
    try {
        const {data, status} = await axios.post('user/token',{
            email,
            password
        });

        if (status === 200) {
            setAuthUser(data.acess,data.refresh);
            alert("Login Successful");
        }

        return { data, error: null};

    } catch (error) {
        return {
            data: null,
            error: error.response.data?.detail || "An error occurred"
        };
    }
};

export const register = async (full_name,email,password,password2) => {

    try {
        const { data } = await axios.post('user/register',{
            full_name,
            email,
            password,
            password2
        })
          
        await login(email,password);
        alert("Registration Sucessful");   
        return { data, error: null}; 

    } catch (error) {
        return {
            data: null,
            error: error.response.data?.detail || "An error occurred"
        };
    }
};


export const setUser = async () => {
    const acess_token = Cookie.get("acess_token");
    const refresh_token = Cookie.get("refresh_token");

    if (!acess_token || !refresh_token) {
        alert("Token not found");
        return;
    }

    if (isAcessTokenExpired(acess_token)) {
        const response = getRefreshToken(refresh_token);
        setAuthUser(response.acess,response.refresh);

    } else {
        setAuthUser (acess_token, refresh_token);
    }
};

export const setAuthUser = (acess_token,refresh_token) => {
    Cookie.set("acess_token", acess_token, {
        expires: 1,
        secure: true,
    });
    Cookie.set("refresh_token", refresh_token, {
        expires: 1,
        secure: true,
    });

    const user = jwt_decode(acess_token) ?? null;

    if (user) {
        useAuthStore.getState().setUser(user);
    } else {
        setAuthUser.getState().setLoading(false);
    }

};


export const getRefreshToken = async () => {
    const refresh_token = Cookie.get("refresh_token");
    const response = await axios.post('token/refresh/',{refresh:
        refresh_token
    });
    return response.data;
}



export const isAcessTokenExpired = (acess_token) => {

        try {
            const decodedToken = jwt_decode(acess_token);
            return decodedToken.exp < Date.now()/1000;

        } catch (error) {
            return true;
            
        }


};



