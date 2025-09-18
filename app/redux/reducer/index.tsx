import { combineReducers } from 'redux';
import drawerReducer from './drawerReducer';
import cartReducer from './cartReducer';
import wishListReducer from './wishListReducer';
import SignUpReducer from './SignUpReducer'
import loginReducer from './loginReducer'
import FilterReducer from './FilterReducer'
 

const rootReducer = combineReducers({
    drawer: drawerReducer,
    cart: cartReducer,
    wishList : wishListReducer,
    signUp :SignUpReducer,
    login:loginReducer,
    filter: FilterReducer
});

export default rootReducer;