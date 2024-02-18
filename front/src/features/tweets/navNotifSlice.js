import { createSlice } from '@reduxjs/toolkit';



const navNotifSlice = createSlice({
    name: 'navNotif',
    initialState: {
        home: 0,
        explore: 0,
        notifications: 0,
        messages: 0,
        bookmarks: 0,
        profile: 0,
    },
    reducers: {
    addNotif(state, action) {
        console.log('recevied', action, 'in redux')
        const { notif } = action.payload;
        console.log(action.payload)
        state[notif.category] += notif.value;
        },
    removeNotif(state, action) {
        const { category } = action.payload;
        // console.log('removing', category)
        // simply set to 0 due to time constraints
        state[category] = 0;
    }
}
})

export const selectNotif = (category) => (state) => state.navNotif[category];

export const { addNotif, removeNotif } = navNotifSlice.actions;
export default navNotifSlice.reducer;