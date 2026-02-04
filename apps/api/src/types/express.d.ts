export {};

declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
      user?:{
        id:string;
        role:string;
        email:string;
      }
    }
  }
}
