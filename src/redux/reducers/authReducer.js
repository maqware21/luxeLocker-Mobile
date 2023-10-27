import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    authUser: false,
}

export const authUserSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authUser: (state, action) => {
            state.authUser = action.payload;
        },
    },
})

// Action creators are generated for each case reducer function
export const { authUser } = authUserSlice.actions

export default authUserSlice.reducer