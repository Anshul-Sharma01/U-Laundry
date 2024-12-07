import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
    baseURL : BASE_URL,
    withCredentials : true,
});

let isRefreshing = false;


axiosInstance.interceptors.request.use(
    async(config) => {
        const accessToken = Cookies.get("accessToken");
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if(error.response.status === 403 && !originalRequest._retry){
            if(isRefreshing){
                const retryRequest = new Promise((resolve) => {
                    const interval = setInterval(() => {
                        const accessToken = Cookies.get("accessToken");
                        if(accessToken){
                            clearInterval(interval);
                            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                            resolve(axiosInstance(originalRequest));
                        }
                    }, 100);
                });
                return retryRequest;
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise(async (resolve, reject) => {
                try{
                    const refreshToken = Cookies.get('refreshToken');
                    const response = await axiosInstance.post("/users/refresh-token", { refreshToken });

                    const newAccessToken = response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;

                    Cookies.set('accessToken', newAccessToken);
                    Cookies.set('refreshToken', newRefreshToken);

                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    resolve(axiosInstance(originalRequest));
                }catch(err){
                    reject(err);
                }finally{
                    isRefreshing = false;
                }
            });
        }else if(error.response.status === 401){
            window.alert("Please log in again");
            localStorage.clear();
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            console.log("Redirected ...");
            window.location.href = import.meta.env.VITE_LOGIN_URL;
        }
        return Promise.reject(error);
    }
)



