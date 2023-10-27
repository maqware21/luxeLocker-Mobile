// Import for creating Store
import { configureStore } from '@reduxjs/toolkit'

// Reducers Import
import authReducer from './reducers/authReducer'



export const store = configureStore({
    reducer: {
        authUser: authReducer,
    },
})

