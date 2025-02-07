import { Elysia } from "elysia";
import { authModel, session } from "./auth.model";

export const userService = new Elysia({prefix: "user/service"})
.state({
    user:{} as Record<string,string>,
    session:{} as Record<string,string>})
.use(authModel)
.use(session)
.macro({
    isSignIn(enabled: boolean){
        if(!enabled) return

        return {
            beforeHandle({error, cookie:{ token}, store:{ session }}){
                if(!token) return error(401,{ 
                   success: false,
                   message: "Unauthorized"});

                const username = session[token.value as unknown as number]

                if(!username) return error(401,{ 
                   success: false,
                   message: "Unauthorized"});
            }
        }

    }
})


export const user = new Elysia({prefix: "/user"})
.use(userService)
.put(
    "/sign-up",
    async ({body:{username, password }, store, error}) => {
        if(store.user[username]){
            return error(400,{
                success: false,
                message:`User ${username} already exists`
             })
        }

        store.user[username] = await Bun.password.hash(password)

        return {
            success: true,
            message:`User ${username} created successfully`
        }
    },
    {
        body: 'sign'
    }
).post(
    '/sign-in',
    async ({
        store:{user, session},
        error,
        body:{username, password },
        cookie:{token}
    }) => {
        if (!user[username] ||
        !(await Bun.password.verify(password, user[username]))){
            return error(401,{
                success: false,
                message: "Invalid username or password"
            })
        }

        const key = crypto.getRandomValues(new Uint32Array(1))[0]
        session[key] = username
        token.value = key
        return {
            success: true,
            message: `Signed in as ${username}`,            
        }
    },{
        body: 'sign',
        cookie: 'session'
    }
).get(
    '/sign-out',
    ({ cookie:{ token }})=>{
        token.remove()
        return {
            success: true,
            message: 'Signed out successfully',
        }
    },{
        cookie:'optionalSession'
    }
).get(
    '/profile',
    ({ cookie:{ token }, store: { session }, error})=>{
        const username = session[token.value];

        return {
            success: true,
            message: `Profile for ${username}`,
            username: username
        }
    },{
        cookie: 'session'
    }
)