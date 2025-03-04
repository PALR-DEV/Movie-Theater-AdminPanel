import { supabase } from "../Config/supabase";

class AuthService {

    async Login(email, password) {
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if(error) {
            throw error
        }
        return data
    }
}

const authService = new AuthService();
export default authService;