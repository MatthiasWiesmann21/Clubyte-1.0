import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import axios from "axios";

const PG = ({ children }: any) => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const persistedUser = useSelector((state: any) => state?.user);
  useEffect(() => {
    const getUser = async () => {
      if (status !== "authenticated") {
        return;
      }
      try {
        const user = await axios.get("/api/user");
  
        if (!user) return;
  
        if (persistedUser) {
          if (JSON.stringify(persistedUser) === JSON.stringify(user.data)) {
            return;
          } else {
            dispatch({ type: "SetUser", payload: user?.data });
          }
        } else {
          dispatch({ type: "SetUser", payload: user?.data });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
  
    getUser();
  }, [status]);
  // return <></>
  return <>{children}</>;
};

export const Providers = ({ children }: any) => (
  <Provider store={store}>
    <PG>{children}</PG>
  </Provider>
);
