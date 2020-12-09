import axios from "axios";

import { ActionType } from "../redux/action-type";
import { store } from "../redux/store";
import ErrorHandlerUiUtils from "./ErrorHandlerUIUtils";

export default class LoginUtils  {
    public static setTokenToAxiosHeader(token : string){
        axios.defaults.headers.common["Authorization"] =
      "Bearer " + token
    }

    public static routeUserToMainPage(userType: string, comp: any){
        if (userType === "Admin") {
            comp.props.history.push("/admin");
          } else if (userType === "Customer") {
            comp.props.history.push("/customer");
          }
    }

    public static setUserCache(token: string, userName: string){
        sessionStorage.setItem("token", "" + token);
        sessionStorage.setItem("userName", userName);
    }

    public static responseSuccessfulGoogle = async (response: any, comp: any) => {
        try {
          let serverResponse = await axios.post(
            comp.props.hostUrl + ":3001/users/google-login",
            { tokenId: response.tokenId }
          );
    
          const serverResponseData = serverResponse.data;
    
          let token = serverResponseData.token;
          LoginUtils.setTokenToAxiosHeader(token);
    
          store.dispatch({ type: ActionType.updateIsUserLoggedIn });
    
          LoginUtils.setUserCache(serverResponseData.token, serverResponseData.userName);
    
          store.dispatch({
            type: ActionType.connectToSocket,
            payload: {
              hostUrl: comp.props.hostUrl,
              token: serverResponseData.token,
            },
          });
    
          LoginUtils.routeUserToMainPage(serverResponseData.userType, comp);
    
        } catch (error) {
          ErrorHandlerUiUtils.handleErrorsOnUi(error, comp);
        }
      };
    
      public static responseFailureGoogle = (response: any) => {
        console.log(response);
      };
}
