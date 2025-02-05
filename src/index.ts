import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { note } from "./note";


const app = new Elysia()
// Apply the swagger plugin
.use(swagger())
.use(note)
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
