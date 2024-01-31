const AppStateReducer = (state, action) => {
  switch (action.type) {
    case "Login": {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...action.payload, isAuthenticated: true })
      );
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    }

    case "Logout": {
      localStorage.removeItem("user");
      return {
        isAuthenticated: false,
        user: null,
      };
    }
    default:
      return state;
  }
};

export default AppStateReducer;
