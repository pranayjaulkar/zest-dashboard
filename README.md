<<<<<<< HEAD
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
=======
# ecommerce-website
>>>>>>> f95df343b2aa7ca9ddd3fd68edc0d26ca8ede6ce
P13
class MyException extends Exception

{

MyException(String message)

{

 super(message);

}

}

class TestMyException

{

public static void main(String args[])

{

 int x=5 , y=1000;

 try

 {

 float z=(float)x/(float)y;

 if(z<0.01)

{

 throw new MyException("number is too 

small");

 }

 }

 catch(MyException e)

 {

 System.out.println("caught 

MyException");

 System.out.println(e.getMessage());

System.out.println(e);

 }

 finally

 {

 System.out.println("i am always 

here");

 }

 }

 }




 P14
class A extends Thread
{
 public void run()
 {
 for(int i=1; i<=5; i++)
 {
 System.out.println("\tFrom Thread A : i = "+ i);
 }
 System.out.println("Exit from A");
 }
}
class B extends Thread
{
 public void run()
 {
 for(int j=1; j<=5; j++)
 {
 System.out.println("\tFrom Thread B : j = "+ j);
 }
 System.out.println("Exit from B");
 }
}
class C extends Thread
{
 public void run()
 {
 for(int k=1; k<=5; k++)
 {
 System.out.println("\tFrom Thread C : k = "+ k);
 }
 System.out.println("Exit from C");
 }
}
class TestThread
{
 public static void main(String args[])

 {

 A a = new A();

 a.start();

 B b = new B();

 b.start();

 C c = new C();

 c.start();

 }

}



P14
