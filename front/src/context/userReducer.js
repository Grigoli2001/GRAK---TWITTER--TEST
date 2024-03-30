import { jwtDecode } from "jwt-decode";

const UserReducer = (state, action) => {
  switch (action.type) {
    case "Login": {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...action.payload, isAuthenticated: true })
      );
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        refresh: action.payload.refresh,
        user: jwtDecode(action.payload.token).user || jwtDecode(action.payload.token),
      };
    }

    case "Logout": {
      localStorage.removeItem("user");
      return {
        isAuthenticated: false,
        token: null,
        refresh: null,
        user: null,
      };
    }

    case "UPDATE":
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
      
    default:
      return state;
  }
};

export default UserReducer;
