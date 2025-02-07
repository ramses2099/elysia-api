import { Elysia, t } from 'elysia';


export const authModel = new Elysia()
.model({
    sign: t.Object({
        username: t.String({minLength: 1}),
        password: t.String({minLength: 4}),
    })
});

export const session = new Elysia()
.model({
    session: t.Cookie({
        token: t.Number()
    },
    {
        secrets:'seia'
    }),
    optionalSession: t.Optional(t.Ref('session'))
});