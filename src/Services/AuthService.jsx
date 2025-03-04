import { supabase } from "../Config/supabase";

class AuthService {
    constructor() {
    }


    async Login(email, password) {
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if(error) {
            throw error
        }
        this.session = data.session;
        return data
    }

    async Logout() {
        const { error } = await supabase.auth.signOut()
        if(error) {
            throw error
        }
    }
}

const authService = new AuthService();
export default authService;