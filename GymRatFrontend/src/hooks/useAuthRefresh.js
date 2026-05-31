import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import axiosInstance from '../utils/axiosInstance';
import { API } from '../constants/api';

const useAuthRefresh = () => {
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const response = await axiosInstance.post(API.REFRESH, {});
        const { data } = response.data;

        if (data?.accessToken) {
          dispatch(setCredentials({
            token: data.accessToken,
            user: {
              id:    data.id,
              name:  data.name,
              email: data.email,
              role:  data.role,
              gymId: data.gymId,
            },
          }));
        }
      } catch(err) {
        console.error("Refresh Hook error",err.message);
      } finally {
        setIsChecking(false);
      }
    };

    tryRefresh();
  }, [dispatch]);

  return { isChecking };
};

export default useAuthRefresh;