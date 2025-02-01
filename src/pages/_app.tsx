import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";


export default function App({ Component, pageProps }: AppProps) {
    try {
        return (
            <SessionProvider session={pageProps.session}>
                <Component {...pageProps} />
            </SessionProvider>
        );
    } catch (error) {
        console.error("❌ Error in _app.tsx:", error);
        return <h1>Something went wrong</h1>;
    }
}
